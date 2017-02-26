FROM ruby:2.4.0-onbuild
ENV LANG C.UTF-8
RUN apt-get update && apt-get install -y nodejs npm && apt-get clean
RUN useradd rails
RUN npm install -g angular bower
USER root
RUN echo "America/New_York" > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata
ENV RAILS_ENV=production
ENV DATABASE_URL="sqlite://dummy.db"
EXPOSE 3030
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN bower install --allow-root
RUN rake --trace assets:precompile
CMD ["unicorn_rails", "-p", "3030", "-c", "config/unicorn.rb"]
