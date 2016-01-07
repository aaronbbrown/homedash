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

    # get percentage of total usage that was generated over the last 1 year
    # or since the beginning of recording
    def percent_gen_last_year
      gen_start = Series.association_join(:register).
                         where(name: 'gen').
                         min(:time)

      use_start = Series.association_join(:register).
                         where(name: 'use').
                         min(:time)

      since = [gen_start,use_start].max
      results = Hash[%w{use gen}.map do |register_name|
        sum = Series.association_join(:register).
                     where(name: register_name).
                     where{time >= since}.
                     sum(:watt_hours).abs
        [register_name, sum]
      end]

      { series: [{
          data: [
            { name: 'Solar',
              y: results['gen'].to_i },
            { name: 'Grid',
              y: (results['use'] - results['gen']).to_i }
        ]}
      ], since: since.to_i * 1000}
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
        SELECT n as year FROM t WHERE n IS NOT NULL ORDER BY n;
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
            AND time < now() - interval '1 week'
            AND date_part('doy', time) BETWEEN
                    date_part('doy', now()) - 4
                AND date_part('doy', now()) + 4
            #{hourly_restriction_sql(register_name: register_name)}
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

    # show year-to-date for every year that we have data
    # prior years will show data up to the current date,
    # not the entire year.  So, if it's 7/4/2015,
    # 2013 and 2014 will be ytd until 7/4/2013 and 7/4/2014
    # respectively
    def ytd_by_year(register_name:)
      register_id = Register.first(name: register_name).id
      results = Series.
        select { [abs(sum(:watt_hours)).as('watt_hours'),
                  date_part('year', :time).as('year')] }.
        where(register_id: register_id).
        where { date_part('doy', :time) <= date_part('doy', Sequel.lit("now()")) }.
        group_by { date_part('year', :time) }.
        order_by { date_part('year', :time) }

      wh_by_year = results.map do |row|
        [row[:year], row[:watt_hours].to_i]
      end

      data = wh_by_year.map { |year,wh| wh.to_i }
      categories = wh_by_year.map { |year,wh| year.to_i.to_s }
      { series: [{ name: 'Watt hours', data: data }],
        categories: categories }
    end

    # return daily watt_hours for the last week
    def daily(register_name:)
      register_id = Register.first(name: register_name).id
      results = Series.
        select { [abs(sum(:watt_hours)).as('watt_hours'),
                  date(:time).as('date')] }.
        where(register_id: register_id).
        where { date(:time) > Sequel.lit("now() - interval '7 days'") }.
        group_by { date(:time) }.
        order_by { date(:time) }

      wh_by_day = results.map do |row|
        [row[:date], row[:watt_hours].to_i]
      end

      data = wh_by_day.map { |day,wh| wh.to_i }
      categories = wh_by_day.map { |day,wh| day.to_s }
      { series: [{ name: 'Watt hours', data: data }],
        categories: categories }
    end

    # return the most recent value, in watts.  Assumes times are
    # at 1 minute granularity
    def current_watts(register_name:)
      granularity = 60 # seconds
      secs_per_min = 3600
      register_id = Register.first(name: register_name).id
      results = Series.reverse_order(:time).first(register_id: register_id)

      max_wh = Series
        .where(register_id: register_id)
        .where{ time > Sequel.lit("now() - interval '1 year'")}
        .max{abs(:watt_hours)}
      max_watts = (max_wh / (granularity/secs_per_min.to_f)).to_f.round(1)
      watts = (results.watt_hours / (granularity/secs_per_min.to_f)).abs.to_f.round(1)

      { categories: [ results.time.to_i ],
        yAxis: { max: max_watts.to_i },
        series: [{
          name: 'Watts',
          data: [watts],
          tooltip: { valueSuffix: ' Watts' }
      }]}
    end

    def daily_watt_hour_histogram(register_name:)
      bucket_size = 1000
      sql = <<-SQL
        WITH daily_sums AS (
          SELECT date_trunc('day',time) AS day,
                abs(sum(watt_hours)) AS watt_hours
          FROM series
          WHERE register_id = ?
          GROUP BY 1
        ), limits AS (
          SELECT max(date_part('year', day)::integer) as max_year,
                min(date_part('year', day)::integer) as min_year,
                max(watt_hours)::integer AS max_wh
          FROM daily_sums
        ), buckets AS (
          SELECT range, year
          FROM limits,
              generate_series(0, limits.max_wh,
                                 #{bucket_size}) AS range,
              generate_series(limits.min_year,
                              limits.max_year) AS year
        ), bucketed_data AS (
          SELECT count(*) AS cnt,
                date_part('year',day) AS year,
                (floor(watt_hours/#{bucket_size})*#{bucket_size})::integer AS range
          FROM daily_sums
          GROUP BY 2,3
        )
        SELECT coalesce(cnt,0) AS cnt, buckets.year, buckets.range
        FROM buckets
        LEFT JOIN bucketed_data
          ON bucketed_data.year = buckets.year
          AND bucketed_data.range = buckets.range
        ORDER BY year, range
      SQL

      register_id = Register.first(name: register_name).id
      results = Sequel::Model.db[sql, register_id].to_hash_groups(:year)
      categories = results[results.keys.first].map { |x| x[:range] }
      series = results.map do |year,data|
        { name: year,
          data: data.map { |x| x[:cnt] } }
      end
      { categories: categories,
        series: series }
    end

# return 0,25,50,75,100 percentiles for daily watt_hours
# per month
    def monthly_percentiles(register_name:)
      register_id = Register.first(name: register_name).id

      sql = <<-SQL
        WITH daily AS (
          SELECT date(time) AS date, abs(sum(watt_hours)) AS wh
          FROM series
          WHERE register_id = ?
          GROUP BY 1
          ORDER BY 1
        )
        SELECT date_trunc('month', date) AS month,
              percentile_cont(array[0,0.25,0.50,0.75,1.0]) WITHIN GROUP (ORDER BY wh) AS percentiles
        FROM daily
        GROUP BY 1
        ORDER BY 1
        LIMIT 18
      SQL

      data = Sequel::Model.db[sql, register_id].map do |row|
        { x: row[:month].to_i * 1000,
          low: row[:percentiles][0],
          q1: row[:percentiles][1],
          median: row[:percentiles][2],
          q3: row[:percentiles][3],
          high: row[:percentiles][4] }
      end

      { series: [{ data: data }] }
    end
  end
end

