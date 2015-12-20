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

  def show
    case params[:id]
    when 'monthly_gen_year'
      result = monthly_gen_year
    when 'daily_gen_hour'
      result = daily_gen_hour
    else
      raise ActionController::RoutingError.new('Not Found')
      false
    end
    respond_with result
  end

  def monthly_gen_year
    Series.monthly_by_year(register_name: 'gen')
  end

  def daily_gen_hour
    Series.daily_by_hour(register_name: 'gen')
  end

private
  def build_statistics_uri(stat_to_return)
    URI.join(request.base_url,
             File.join(request.path, stat_to_return)).to_s
  end
end
