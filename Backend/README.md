# Police Management System Backend

A comprehensive Django REST Framework backend for a police management system, implementing role-based access control (RBAC) and complete case management workflow.

## Features

### User Management & Authentication
- Custom User model with role-based permissions
- Police ranks: Trainee, Medical Examiner, Officer, Detective, Sergeant, Captain, Police Chief
- Token-based authentication
- User registration and login endpoints

### Core Functionality
- **Cases Management**: Create, update, and track cases with different crime levels (1, 2, 3)
- **Crime Scenes**: Document and manage crime scene information
- **Complaints**: Handle citizen complaints that can lead to case creation
- **Evidence**: Manage various types of evidence (biological, medical, vehicle, identification documents)
- **Witnesses**: Record and manage witness statements
- **Suspects**: Track suspects, interrogations, charges, and custody status
- **Trials**: Manage trial information, verdicts, and court proceedings
- **Rewards & Payments**: Handle officer rewards and payment processing (bail, fines)

## Technology Stack

- Django 6.0
- Django REST Framework 3.14
- SQLite (default, configurable for production)
- Django CORS Headers
- Django Filter

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wp
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
cd config
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/auth/users/register/` - Register a new user
- `POST /api/auth/users/login/` - Login and get token
- `GET /api/auth/users/me/` - Get current user profile

### Cases
- `GET /api/cases/` - List all cases
- `POST /api/cases/` - Create a new case
- `GET /api/cases/{id}/` - Get case details
- `PUT/PATCH /api/cases/{id}/` - Update case

### Crime Scenes
- `GET /api/crime-scenes/` - List all crime scenes
- `POST /api/crime-scenes/` - Create crime scene
- `GET /api/crime-scenes/{id}/` - Get crime scene details

### Complaints
- `GET /api/complaints/` - List all complaints
- `POST /api/complaints/` - Create a new complaint
- `GET /api/complaints/{id}/` - Get complaint details

### Evidence
- `GET /api/evidence/` - List all evidence
- `POST /api/evidence/` - Create evidence
- Specialized endpoints for different evidence types:
  - `/api/evidence/biological/`
  - `/api/evidence/medical/`
  - `/api/evidence/vehicle/`
  - `/api/evidence/identification/`

### Witnesses
- `GET /api/witness-statements/` - List witness statements
- `POST /api/witness-statements/` - Create witness statement

### Suspects
- `GET /api/suspects/` - List all suspects
- `POST /api/suspects/` - Create suspect record
- `GET /api/suspects/{id}/` - Get suspect details

### Trials
- `GET /api/trials/` - List all trials
- `POST /api/trials/` - Create trial
- `GET /api/trials/{id}/` - Get trial details

### Rewards & Payments
- `GET /api/rewards/` - List rewards
- `POST /api/rewards/` - Create reward
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment

## Role-Based Access Control

The system implements hierarchical permissions based on police ranks:

- **Trainee**: Basic read access
- **Officer/Patrol Officer**: Can handle Level 3 crimes, create complaints
- **Detective**: Can handle Level 2 and 3 crimes, create cases, manage suspects
- **Sergeant**: Can handle Level 2 and 3 crimes, create rewards
- **Captain**: Can handle Level 1 and 2 crimes, approve rewards
- **Police Chief**: Full access, can handle all crime levels

## Testing

Run tests with:
```bash
python manage.py test
```

## Project Structure

```
config/
├── accounts/          # User management and authentication
├── core/              # Cases and crime scenes
├── complaints/        # Complaint handling
├── evidence/          # Evidence management
├── witnesses/         # Witness statements
├── suspects/          # Suspect management
├── trials/            # Trial management
├── rewards/           # Rewards and payments
└── config/            # Django project settings
```

## Development

This is the backend implementation (Checkpoint 1). The frontend will be implemented separately using React/Next.js (Checkpoint 2).

## License

This project is for educational purposes as part of a web programming course.
