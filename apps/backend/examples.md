# Test Route Examples

Here are example `curl` requests to interact with the new `/test` endpoints for `User` and `MarkDataCollection`.

## User Collection (`/test/users`)

### Create a User
```bash
curl -X POST http://localhost:3000/test/users \
  -H "Content-Type: application/json" \
  -d '{
    "entryYear": 2024,
    "freeChoice": true
  }'
```

### Get All Users
```bash
curl http://localhost:3000/test/users
```

### Delete a User
Replace `:id` with the `_id` or `uuid` of the user you want to delete.
```bash
curl -X DELETE http://localhost:3000/test/users/:id
```

## Mark Data Collection (`/test/marks`)

### Create Mark Data
**Note:** You must provide a valid UUID (usually from a User) for the `_id` field.
```bash
curl -X POST http://localhost:3000/test/marks \
  -H "Content-Type: application/json" \
  -d ' {
    "_id": "YOUR_VALID_UUID_HERE",
    "marks": [
      {
        "code": "CS101",
        "mark": 10
      },
      {
        "code": "MA101",
        "mark": 12
      }
    ]
  }'
```

### Get All Mark Data
```bash
curl http://localhost:3000/test/marks
```

### Delete Mark Data
Replace `:id` with the `_id` (which is the UUID) of the mark data you want to delete.
```bash
curl -X DELETE http://localhost:3000/test/marks/:id
```
