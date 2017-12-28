FROM nginx
COPY ./dist/* /usr/share/nginx/html/
#RUN cd /usr/share/nginx/html/ && npm install
EXPOSE 8080