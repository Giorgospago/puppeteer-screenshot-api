# Screenshot & Video Recording API
Based on NodeJs and Puppeteer

## GitHub
https://github.com/Giorgospago/puppeteer-screenshot-api

## Install
Simple docker command
```sh
docker run -d -p 3030:3030 giorgospago/puppeteer-tools
```

With `docker-compose.yml` file

```yml
version: "3.7"

services:
  puppeteer-tools:
    image: giorgospago/puppeteer-tools
    ports:
      - 3030:3030
    volumes:
      - type: bind
        source: ./your-data-directory
        target: /var/www/public
```

## Usage of API
### Screenshot
`https://your-endpoint.com/image?url=https://google.com`

![alt text](https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Google_Videos_Homepage_Search_Engine_Screenshot.png/640px-Google_Videos_Homepage_Search_Engine_Screenshot.png)

### Video Recording
`https://your-endpoint.com/image?url=https://google.com`
Result:
```json
{
    "success": true,
    "url": "https://your-endpoint.com/videos/google.com-1920x1080-00000-000-000-000-0000000.mp4"
}
```
