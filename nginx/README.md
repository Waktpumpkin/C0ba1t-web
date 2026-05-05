# c0ba1t.cn Nginx 部署说明

## 1. 上传并解压网站

```bash
sudo mkdir -p /var/www/c0ba1t
# 上传 C0ba1t-web-deploy.zip 到服务器后：
sudo unzip C0ba1t-web-deploy.zip -d /var/www/c0ba1t
sudo chown -R www-data:www-data /var/www/c0ba1t
```

## 2. 启用 HTTP 站点

```bash
sudo cp c0ba1t.cn.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/c0ba1t.cn.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 3. 用 Certbot 申请证书并自动配 HTTPS

```bash
sudo certbot --nginx -d c0ba1t.cn -d www.c0ba1t.cn
```

按提示选择是否把 HTTP 重定向到 HTTPS（建议选是）。Certbot 会自动修改 `c0ba1t.cn.conf`，添加 443、证书路径和跳转。

## 4. 验证

- HTTP: http://c0ba1t.cn  
- HTTPS: https://c0ba1t.cn（证书生效后）

证书续期（crontab 里一般已有）：`sudo certbot renew --quiet`

---

## conflicting server name "c0ba1t.cn" 报错

说明 80/443 上有多处定义了 `server_name c0ba1t.cn`，nginx 只认第一个，后面的会被忽略。

**1. 找出所有定义了 c0ba1t.cn 的配置**

```bash
sudo grep -r "c0ba1t.cn" /etc/nginx/
```

**2. 若 certbot 把 c0ba1t 写进了 default（和 sites-available/c0ba1t.cn 重复）**

证书已经在 default 里配好了，我们只保留**独立站点文件**一份，从 default 里删掉 certbot 加的那两段：

- 备份并编辑 default：
  ```bash
  sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
  sudo nano /etc/nginx/sites-available/default
  ```
- 在 default 里删掉**整段**下面两类 server 块（从 `server {` 到对应的 `}`）：
  - 含有 `server_name c0ba1t.cn www.c0ba1t.cn` 且只有 `listen 80`、`return 301` / `if ($host = c0ba1t.cn)` 的那一段（HTTP 跳 HTTPS）；
  - 含有 `server_name c0ba1t.cn www.c0ba1t.cn` 且 `listen 443 ssl`、`ssl_certificate .../c0ba1t.cn/...` 的那一段（HTTPS）。
- 用本仓库里的 **c0ba1t.cn.conf**（已包含 80→443 跳转 + 443 站点）覆盖服务器上的配置：
  ```bash
  # 在你自己电脑上把最新的 nginx/c0ba1t.cn.conf 上传到服务器后：
  sudo cp /path/to/c0ba1t.cn.conf /etc/nginx/sites-available/c0ba1t.cn
  ```
- 测试并重载：
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```

**3. 其他情况（conf.d 里也有一份）**

- 若在 **sites-available/c0ba1t.cn** 和 **conf.d/xxx.conf** 里都有：删掉 conf.d 里该 server 块，或改掉那份的 `server_name`，只保留 sites-available 里这一份。

改完后执行 `sudo nginx -t && sudo systemctl reload nginx`，不应再出现 `conflicting server name`。

**4. 仍然报 80/443 都 conflicting 时：精确定位并只留一份**

在服务器上执行，看**哪几个“被加载的”文件**里有 c0ba1t.cn（sites-enabled 里的是实际加载的）：

```bash
# 被加载的站点
ls -la /etc/nginx/sites-enabled/

# 哪些文件里含有 c0ba1t.cn（先看启用的）
sudo grep -l "c0ba1t" /etc/nginx/sites-enabled/* 2>/dev/null

# 以及 conf.d 是否也有
sudo grep -l "c0ba1t" /etc/nginx/conf.d/* 2>/dev/null
```

会列出两个（或更多）文件，例如 `sites-enabled/default` 和 `sites-enabled/c0ba1t.cn`。**只保留一个**：

- **方案 A（推荐）**：只保留 `c0ba1t.cn` 这份，从 **default** 里把 c0ba1t 相关的内容删干净。  
  - 再次打开 default：`sudo nano /etc/nginx/sites-available/default`  
  - 搜索 `c0ba1t`，删掉包含它的**整个** `server { ... }` 块（可能有两个：一个 80 跳转、一个 443），保存后 `sudo nginx -t && sudo systemctl reload nginx`。

- **方案 B**：不用独立站点文件，只用 default 里 certbot 配的那份。  
  - 删掉 c0ba1t 的软链：`sudo rm /etc/nginx/sites-enabled/c0ba1t.cn`  
  - 确认 default 里 c0ba1t 的 443 块中 `root` 是 `/var/www/c0ba1t`，然后 `sudo nginx -t && sudo systemctl reload nginx`。

---

## 访问到 Nginx 默认页时排查

**1. 确认站点已启用并生效**

```bash
# 是否有 c0ba1t 的软链
ls -la /etc/nginx/sites-enabled/ | grep c0ba1t

# 没有则启用并重载
sudo ln -sf /etc/nginx/sites-available/c0ba1t.cn.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**2. 确认请求命中 c0ba1t 的 server**

```bash
# 查看当前生效的配置里是否有 c0ba1t.cn 的 server_name
sudo nginx -T | grep -A2 "server_name.*c0ba1t"
```

**3. 确认网站目录和首页存在**

```bash
ls -la /var/www/c0ba1t/
ls -la /var/www/c0ba1t/index.html
```

**4. 若仍走默认页：去掉 default 的 default_server（可选）**

你的 `default` 里是 `listen 80 default_server`，只有「没有别的 server 匹配」时才会用 default。若上面都正常仍看到默认页，多半是配置没被加载。若你希望 80 端口只给 c0ba1t，可改 default：

```bash
sudo nano /etc/nginx/sites-available/default
# 把 listen 80 default_server; 改成 listen 80;（去掉 default_server）
# 然后 sudo nginx -t && sudo systemctl reload nginx
```
