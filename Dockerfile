FROM ruby:2.2.4-onbuild
ENV LANG C.UTF-8
RUN apt-get update
RUN apt-get install -y nodejs
RUN useradd rails
USER root
RUN echo "America/New_York" > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata
ENV RAILS_ENV=production
USER rails
EXPOSE 3030
ONBUILD "rake assets:precompile"
CMD ["unicorn_rails", "-p", "3030", "-c", "config/unicorn.rb"]
