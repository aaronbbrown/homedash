class Series < ActiveRecord::Base
  belongs_to :register

  class <<self
    def generation_since(start, register_name)
      sql = <<-SQL
        select sum(watt_hours) as sum_wh
        from series s
        join registers r
          ON r.id = s.register_id
        where time >= ?
          and r.name = ?
        limit 1
      SQL
      sanitized_sql = sanitize_sql_array([sql, start, 'gen'])
      results = select_all(sanitized_sql).first
      result[:sum_wh].nil? ? 0 : result[:sum_wh].abs.round(1)
    end

    def monthly_gen_year
      register = Register.find_by_name('gen')
      register_id = register.id

      sql = <<-SQL
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
      sanitized_sql = sanitize_sql_array([sql, register_id, register_id])
      years = ActiveRecord::Base.connection.select_all(sanitized_sql).map { |x| x['year'] }
      puts "Years: #{years}"

      sql = <<-SQL
        SELECT abs(sum(watt_hours)) as watt_hours, date_trunc('month', time) as month
        FROM series s
        WHERE s.register_id = ?
          AND date_part('year', time) = ?
        GROUP BY date_trunc('month', time)
        ORDER BY date_trunc('month', time)
      SQL

      now = Time.new
#      month_start = Time.mktime(now.year,now.month)
#      gen_mtd_wh = generation_since(month_start, 'gen')

      series = years.map do |year|
        sanitized_sql = sanitize_sql_array([sql, register_id, year])
        results = ActiveRecord::Base.connection.select_all(sanitized_sql)

        points = results.map do |row|
        puts "row: #{row}"
          normalized_time = Time.new(now.year, row['month'].month)
          unix_time = normalized_time.to_i
          { x: unix_time, y: row['watt_hours'].to_i }
        end

        { name: year.to_s,
          data: points }
      end
    end
  end
end
