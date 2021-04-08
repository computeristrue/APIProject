module.exports = {
  apps: [{
    name: "APIGateway",
    script: "./bin/www",
    error_file: "E:/APIProject/pm2Log/err.log",
    out_file: "E:/APIProject/pm2Log/out.log"
  }]
}