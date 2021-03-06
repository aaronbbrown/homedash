require File.expand_path('../boot', __FILE__)

#require 'rails/all'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'sprockets/railtie'

ActiveSupport::Logger.class_eval do
  # monkey patching here so there aren't duplicate lines in console/server
  # see https://github.com/rails/rails/issues/11415
  def self.broadcast(logger)
    Module.new do
    end
  end
end

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Homedash
  class Application < Rails::Application
    config.logger = ::Logger.new($stdout)

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
#    config.active_record.raise_in_transactional_callbacks = true
    config.sequel.after_connect = proc do
      begin
        Sequel::Model.db.extension :pg_array
      rescue
        config.logger.warn "Unable to load pg_array"
      end
    end
  end
end
