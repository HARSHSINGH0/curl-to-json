## Curl to Json

##### **curl-to-json** converts **curl** requests to **JSON** requests
##### **Easy to use inside Frontend, no Backend support needed (Nodejs NPM packages)**
##### **No Dependencies**

### Example

##### Curl

    curl -X POST -H "Content-Type: application/json" \
    -H 'Accept-Encoding: gzip, deflate' \
    -H 'Accept-Language: en-US,en;q=0.8,da;q=0.6' \
    -d '{"name": "Harsh", "email": "harshsinghzero@gmail.com", "message": "Hello I am Harsh"}' \
    https://github.com/HARSHSINGH0

##### Json

    {
        "header": {
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.8,da;q=0.6"
        },
        "method": "POST",
        "url": "https://github.com/HARSHSINGH0",
        "data": {
            "name": "Harsh",
            "email": "harshsinghzero@gmail.com",
            "message": "Hello I am Harsh"
        }
    }

### Usage

    <script src="curl-to-json-object1.js"></script>
    <script>
    
    const curlCommand = "curl -X POST -H "Content-Type: application/json" \
    -H 'Accept-Encoding: gzip, deflate' \
    -H 'Accept-Language: en-US,en;q=0.8,da;q=0.6' \
    -d '{"name": "Harsh", "email": "harshsinghzero@gmail.com", "message": "Hello I am Harsh"}' \
    https://github.com/HARSHSINGH0";
    
    console.log(curltojsonobject(curlCommand));
    
    </script>

<hr>

**Author**
https://github.com/HARSHSINGH0
