# Restaurant Reviews Project

This project is made for Udacity Google Mobile Specialist nanodegree program.

## Project Overview: Stage 3

This is a **Restaurant Reviews** project. Users are able to view restaurants information and view them on leaflet/Mapbox Maps.
A static webpage is converted to a mobile-ready web application. I took a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. I also added a service worker to begin the process of creating a seamless offline experience for users.
Restaurant data served from an api server. The client application works offline. JSON responses are cached using the IndexedDB API. Any data previously accessed while connected is reachable while offline.
A form for adding new review and a favourite restaurant button added on stage three.
Form works offline and synchronize data when online.

### Site Performance
* Progressive Web App: 97
* Performance: 91
* Accessibility: 100

Check the audit report file:
`audit-report-20180628T162432.htm`

### Instructions

###### Install project dependancies
```Install project dependancies
# npm i
```
###### Install Sails.js globally
```Install sails global
# npm i sails -g
```
###### Build via webpack
```Run build script
# npm run build
```
###### Start the server
```Start server
# node server
```
### You should now have access to your API server environment
debug: Environment : development
debug: Port        : 1337

### Enter address in the address bar of your browser 
```localhost:1337```

## Architecture
Local server
- Node.js
- Sails.js