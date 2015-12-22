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
#    result = Rails.cache.fetch("#{params[:id]}_#{params[:register]}", expires_in: 1.minute) do
      result = case params[:id]
      when 'monthly_by_year'
        Series.monthly_by_year(register_name: params[:register])
      when 'hourly_past_year'
        Series.daily_by_hour(register_name: params[:register])
      when 'hourly_vs_historical'
        hourly_vs_historical(register_name: params[:register])
      when 'ytd_by_year'
        Series.ytd_by_year(register_name: params[:register])
      when 'daily'
        Series.daily(register_name: params[:register])
      when 'current_watts'
        Series.current_watts(register_name: params[:register])
      else
        raise ActionController::RoutingError.new('Not Found')
        false
      end
#    end
    respond_with result
  end

  def hourly_vs_historical(register_name:)
    today = Series.hourly_today(register_name: register_name)
    historical = Series.hourly_historical_average(register_name: register_name)
    { categories: today[:categories],
      series: today[:series] + historical[:series] }
  end

private
  def build_statistics_uri(stat_to_return)
    URI.join(request.base_url,
             File.join(request.path, stat_to_return)).to_s
  end
end
