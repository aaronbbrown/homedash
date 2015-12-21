class StatisticsController < ApplicationController
  before_action :ensure_json_request
  skip_before_action :verify_authenticity_token

  def index
    response = {
      statistics: [
        { name: 'monthly_gen_year',
          description: 'Solar generation month over month, by year',
          uri: build_statistics_uri('monthly_gen_year') },
        { name: 'daily_gen_hour',
          description: 'Daily solar generation by hour',
          uri: build_statistics_uri('daily_gen_by_hour') }
      ]
    }
    respond_with response
  end

  def show_by_register
    result = Rails.cache.fetch("#{params[:id]}_#{params[:register]}", expires_in: 1.hour) do
      case params[:id]
      when 'monthly_by_year'
        Series.monthly_by_year(register_name: params[:register])
      when 'hourly_past_year'
        Series.daily_by_hour(register_name: params[:register])
      when 'hourly_vs_historical'
        hourly_vs_historical(register_name: params[:register])
      else
        raise ActionController::RoutingError.new('Not Found')
        false
      end
    end
    respond_with result
  end

  def hourly_vs_historical(register_name:)
    today = Series.hourly_today(register_name: register_name)
    historical = Series.hourly_historical_average(register_name: register_name)
    { categories: today[:categories],
      series: today[:series] + historical[:series] }
  end

  def monthly_gen_year
    Rails.cache.fetch("monthly_gen_year", expires_in: 1.hours) do
      Series.monthly_by_year(register_name: 'gen')
    end
  end

  def monthly_use_year
    Rails.cache.fetch("monthly_use_year", expires_in: 1.hours) do
      Series.monthly_by_year(register_name: 'use')
    end
  end


  def daily_gen_hour
    Rails.cache.fetch("daily_gen_hour", expires_in: 1.hours) do
      Series.daily_by_hour(register_name: 'gen')
    end
  end

  def daily_use_hour
    Rails.cache.fetch("daily_use_hour", expires_in: 1.hours) do
      Series.daily_by_hour(register_name: 'use')
    end
  end

private
  def build_statistics_uri(stat_to_return)
    URI.join(request.base_url,
             File.join(request.path, stat_to_return)).to_s
  end
end
