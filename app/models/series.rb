class Series < Sequel::Model
  many_to_one :register

  class << self
    # for some registers, like solar, we don't
    # care about night-time
    def hourly_restriction_sql(register_name:)
      if register_name == 'gen'
        return "AND date_part('hour',time) BETWEEN 5 AND 21"
      end
      ""
    end

    # for some registers, like solar, we don't
    # care about night-time
    def hourly_range(register_name:)
      if register_name == 'gen'
        (5..21)
      else
        (0..23)
      end
    end


    # make an array of categories
    # pad incoming data so the data array
    # has a 1-1, 0 padded relationship with the categories
    #
    # Expect incoming data hash
    # { "November" => 123, "December" => 456 }
    #
    # return [0,0,0,0,0,0,0,0,0,123,456]
    def pad_points(categories, data)
      categories.compact.map { |index| data[index] || 0 }
    end

    def monthly_by_year(register_name:)
      register_id = Register.first(name: register_name).id

      # postgres is bad at select distinct queries.  Use a recursive query
      # http://zogovic.com/post/44856908222/optimizing-postgresql-query-for-distinct-values
      query = <<-SQL
        WITH RECURSIVE t(n) AS (
          SELECT min(date_part('year',time))
          FROM series
          WHERE register_id = ?
          UNION
          SELECT (
            SELECT date_part('year',time)
            FROM series WHERE date_part('year',time) > n
              AND register_id = ?
            ORDER BY date_part('year',time)
            LIMIT 1
          )
          FROM t WHERE n IS NOT NULL
        )
        SELECT n as year FROM t WHERE n IS NOT NULL ORDER BY n DESC;
      SQL

      years = Sequel::Model.db[query, register_id, register_id].map { |row| row[:year].to_i }

      series = years.map do |year|
        results = Series.
          select { [abs(sum(:watt_hours)).as('watt_hours'),
                    date_trunc('month', :time).as('month')] }.
          where(register_id: register_id).
          where { date_part('year', :time) =~ year }.
          group_by { date_trunc('month', :time) }.
          order_by { date_trunc('month', :time) }

        points = Hash[results.map do |row|
          [Date::MONTHNAMES[row[:month].month], row[:watt_hours].to_i]
        end]
        points = pad_points(Date::MONTHNAMES.compact, points)

        { name: year.to_s,
          data: points }
      end

      { series: series,
        categories: Date::MONTHNAMES.compact }
    end

    # get historical average by computing the average wh generated each hour
    # during this week in previous years.
    def hourly_historical_average(register_name:)
      register_id = Register.first(name: register_name).id
      query = <<-SQL
        SELECT abs(avg(sum_wh)) as avg_wh,
               date_part('hour', time_hour) as hour
        FROM (
          SELECT sum(watt_hours) as sum_wh,
                 date_trunc('hour', time) as time_hour
          FROM series s
          WHERE register_id = ?
            AND date_part('week', time) = date_part('week', now())
            #{hourly_restriction_sql(register_name: register_name)}
            AND date_part('year', time) < date_part('year', now())
          GROUP BY date_trunc('hour', time)
          ORDER BY date_trunc('hour', time)
          ) sums
        GROUP BY date_part('hour', time_hour)
        ORDER BY date_part('hour', time_hour)
      SQL
      results = Sequel::Model.db[query, register_id]
      points = Hash[results.map do |row|
        [row[:hour].to_i, row[:avg_wh].to_i]
      end]

      categories = hourly_range(register_name: register_name).to_a
      { categories: categories.map { |hour| "#{hour}:00" },
        series: [
          { data: pad_points(categories, points), name: 'Historical Average'}
        ] }
    end

    # get watt_hours by hour for today next to historical average
    def hourly_today(register_name:)
      register_id = Register.first(name: register_name).id

      query = <<-SQL
        SELECT abs(sum(watt_hours)) as watt_hours,
               date_part('hour', time) as hour
        FROM series s
        WHERE register_id = ?
          AND date(time) = date(now())
          #{hourly_restriction_sql(register_name: register_name)}
        GROUP BY date_part('hour', time)
        ORDER BY date_part('hour', time)
      SQL
      results = Sequel::Model.db[query, register_id]
      points = Hash[results.map do |row|
        [ row[:hour].to_i, row[:watt_hours].to_i ]
      end]

      categories = hourly_range(register_name: register_name).to_a
      { categories: categories.map { |hour| "#{hour}:00" },
        series: [
          { data: pad_points(categories, points), name: 'Today'}
        ] }
    end

    # this is used in the heat map for hourly data over the course of an
    # entire year.
    def daily_by_hour(register_name:)
      register_id = Register.first(name: register_name).id
      sql = <<-SQL
        SELECT date(time) AS date,
               date_part('hour', time) as hour,
               abs(sum(watt_hours)) as watt_hours
        FROM series s
        WHERE register_id = ?
          AND time > date_trunc('day', now() - interval '1 year')
          #{hourly_restriction_sql(register_name: register_name)}
        GROUP BY date(time), date_part('hour',time)
        ORDER BY date(time), date_part('hour',time);
      SQL
      results = Sequel::Model.db[sql, register_id]
      data = results.map do |row|
        [row[:date].to_time.to_i * 1000,
         row[:hour].to_i,
         row[:watt_hours].to_i ]
      end
      { series: {
          data: data,
          min_value: data.map { |x| x.last }.min,
          max_value: data.map { |x| x.last }.max,
        },
        labels: ['date','hour','Watt hours (Wh)']}
    end
  end
end
