class Series < Sequel::Model
  many_to_one :register

  class << self
    def generation_since(start, register_name)
      query = <<-SQL
        select sum(watt_hours) as sum_wh
        from series s
        join registers r
          ON r.id = s.register_id
        where time >= ?
          and r.name = ?
      SQL
      result = Sequel::Model.db[query, start, register_name].first
      result[:sum_wh].nil? ? 0 : result[:sum_wh].abs.round(1)
    end

    # make an array of 12 data points
    # where .first corresponds to Jan, .last to Dec, etc
    # pad incoming data so excluded months get 0
    #
    # Expect incoming data hash
    # { "November" => 123, "December" => 456 }
    #
    # return [0,0,0,0,0,0,0,0,0,123,456]
    def pad_monthly_points(data)
      Date::MONTHNAMES.compact.map { |month| data[month] || 0 }
    end

    def monthly_by_year(register_name:)
      now = Time.new
      results = Sequel::Model.db[:registers].select(:id).where(name: register_name).first
      register_id = results[:id]

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

      query = <<-SQL
        SELECT abs(sum(watt_hours)) as watt_hours, date_trunc('month', time) as month
        FROM series s
        JOIN registers r
          ON r.id = s.register_id
        WHERE r.name = ?
          AND date_part('year', time) = ?
        GROUP BY date_trunc('month', time)
        ORDER BY date_trunc('month', time)
      SQL

      now = Time.new
      month_start = Time.mktime(now.year,now.month)
      gen_mtd_wh = generation_since(month_start, register_name)

      series = years.map do |year|
        results = Sequel::Model.db[query, register_name, year]

        points = Hash[results.map do |row|
          [Date::MONTHNAMES[row[:month].month], row[:watt_hours].to_i]
        end]
        points = pad_monthly_points(points)

        { name: year.to_s,
          data: points }
      end

      { series: series,
        categories: Date::MONTHNAMES.compact }
    end

    def daily_by_hour(register_name:)
      hourly_restriction_sql = nil
      if register_name == 'gen'
        hourly_restriction_sql = "AND date_part('hour',time) BETWEEN 5 AND 21"
      end

      sql = <<-SQL
        SELECT date(time) AS date,
               date_part('hour', time) as hour,
               abs(sum(watt_hours)) as watt_hours
        FROM series s
        JOIN registers r ON r.id = s.register_id
        WHERE r.name = ?
          AND time > date_trunc('day', now() - interval '1 year')
          #{hourly_restriction_sql}
        GROUP BY date(time), date_part('hour',time)
        ORDER BY date(time), date_part('hour',time);
      SQL
      results = Sequel::Model.db[sql, register_name]
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