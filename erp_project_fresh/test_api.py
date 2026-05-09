import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/login/',
    data=json.dumps({'username': 'admin', 'password': 'admin1234'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req, context=ctx)
    tokens = json.loads(res.read())
    token = tokens['token']
    print('Login successful.')
except Exception as e:
    print('Login failed', e)
    exit()

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

def test_post(url, data):
    print(f'\n--- Testing {url} ---')
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    try:
        res = urllib.request.urlopen(req, context=ctx)
        print('SUCCESS:', json.loads(res.read()))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f'FAILED ({e.code}):')
        try:
            print(json.loads(err_body))
        except:
            import re
            m1 = re.search(r'<title>(.*?)</title>', err_body)
            m2 = re.search(r'<pre class="exception_value">(.*?)</pre>', err_body, re.DOTALL)
            if m1: print('Error Title:', m1.group(1))
            if m2: print('Exception:', m2.group(1).strip())

test_post('http://127.0.0.1:8000/api/employees/', {'name': 'John Doe', 'role': 'engineer', 'salary': 85000, 'attendance': 95})
test_post('http://127.0.0.1:8000/api/transactions/', {'amount': 1500.50, 'type': 'income'})
test_post('http://127.0.0.1:8000/api/inventory/', {'product_name': 'Office Chair', 'quantity': 50})
