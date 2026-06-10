# API Documentation

## POST /fruits/upload
Upload a new fruit photo.
```bash
curl -X POST http://localhost:8000/fruits/upload \
  -F "file=@apple.jpg" \
  -F "donor_name=Budi" \
  -F "contact=0812345678" \
  -F "location=Jakarta" \
  -F "quantity_kg=5.0"
```

## GET /fruits
Retrieve a list of fruits.
```bash
curl -X GET "http://localhost:8000/fruits/?status=fresh"
```

## GET /fruits/{id}
Retrieve details for a specific fruit.
```bash
curl -X GET http://localhost:8000/fruits/1
```

## POST /allocations
Create a manual allocation.
```bash
curl -X POST http://localhost:8000/allocations/ \
  -H "Content-Type: application/json" \
  -d '{"fruit_id": 1, "allocation_type": "orphanage"}'
```

## GET /allocations
Retrieve a list of allocations.
```bash
curl -X GET http://localhost:8000/allocations/
```

## GET /dashboard/stats
Retrieve analytics for the dashboard.
```bash
curl -X GET http://localhost:8000/dashboard/stats
```

## GET /health (Backend)
Check Backend health.
```bash
curl -X GET http://localhost:8000/health
```

## GET /health (AI Service)
Check AI Service health.
```bash
curl -X GET http://localhost:8001/health
```
