SECONDS_BETWEEN_REQUESTS = 0.5
REQUEST_TIMEOUT_SECONDS = 2
# recreation.gov responds with `403` errors unless the user agent string
# is spoofed to look like a GUI web browser
FAKE_USER_AGENT_HEADER = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0'}
