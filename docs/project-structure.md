# VeloPath Mini App - Project Structure

## 📁 Directory Structure

```
MiniYacht/
├── 📄 public/                     # Static files (served by Vercel)
│   ├── 📄 index.html             # Main application HTML
│   └── 📄 assets/                # Static assets
│       ├── 🖼️ background.jpg    # Background image
│       ├── 🎵 birds.mp3         # Audio files
│       └── 🎵 waves.mp3
├── 📄 src/                       # Source code
│   ├── 📄 js/                    # JavaScript files
│   │   └── 📄 app.js             # Main application logic
│   └── 📄 css/                   # Stylesheets
│       └── 📄 styles.css         # Main application styles
├── 📄 api/                       # Serverless functions (Vercel)
│   └── 📄 index.js               # API endpoints
├── 📄 docs/                      # Documentation
│   ├── 📄 project-structure.md   # This file
│   └── 📄 api-documentation.md   # API docs
├── 📄 tests/                     # Testing files
│   ├── 📄 test-app.js            # Automated tests
│   └── 📄 test-report.md        # Test results
├── 📄 _backend/                  # Legacy backend (for reference)
│   ├── 📄 server.js              # Express server
│   └── 📄 package.json           # Backend dependencies
├── 📄 .gitignore                 # Git ignore rules
├── 📄 .vscode/                   # VS Code settings
├── 📄 README.md                  # Project documentation
├── 📄 package.json               # Root dependencies
├── 📄 vercel.json                # Vercel deployment config
├── 📄 run-tests.html             # Test runner interface
└── 📄 test-report.md             # Testing summary
```

## 🚀 Deployment Structure

### Vercel Serverless Architecture

- **Frontend**: `/public/` directory - Static files served directly
- **Backend**: `/api/index.js` - Serverless function for all API endpoints
- **Assets**: `/assets/` directory - Images, audio files, etc.
- **Source**: `/src/` directory - CSS and JavaScript files

### URL Mapping

| URL | Destination | Description |
|-----|-------------|-------------|
| `/` | `/public/index.html` | Main application |
| `/api/*` | `/api/index.js` | All API endpoints |
| `/src/*` | `/src/*` | CSS and JS files |
| `/assets/*` | `/assets/*` | Static assets |

## 📦 File Organization

### Frontend Files

#### `/public/index.html`
- Main HTML structure
- Meta tags and SEO
- Telegram WebApp script inclusion
- Responsive design structure

#### `/src/css/styles.css`
- Complete application styling
- Telegram theme variables
- Responsive design
- Animation and transitions

#### `/src/js/app.js`
- Main application logic
- State management
- API integration
- Telegram WebApp integration
- GPS tracking functionality
- Step counter implementation
- Achievement system

### Backend Files

#### `/api/index.js`
- Express.js serverless function
- All API endpoints
- User data management
- Route tracking
- Conversion functions
- Withdrawal processing
- Statistics calculation

### Configuration Files

#### `vercel.json`
- Vercel deployment configuration
- URL rewriting rules
- Serverless function settings
- Route mapping

#### `package.json`
- Root project dependencies
- Build scripts
- Development tools
- Project metadata

### Documentation Files

#### `README.md`
- Project overview
- Installation instructions
- API documentation
- Deployment guide

#### `docs/`
- Detailed documentation
- API reference
- Architecture overview

### Testing Files

#### `tests/`
- Automated test suite
- Test utilities
- Test reports

## 🔧 Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Run local server: `npx http-server -p 8080`
3. Open browser: `http://localhost:8080/public/`
4. Run tests: Open `run-tests.html`

### Production Deployment
1. Push changes to GitHub
2. Vercel automatically deploys
3. Application available at Vercel URL
4. API endpoints available at `/api/*`

### File Modifications

#### Adding New Features
1. Update `/src/js/app.js` for frontend logic
2. Update `/api/index.js` for backend endpoints
3. Update `/src/css/styles.css` for styling
4. Update `/public/index.html` for new elements
5. Add tests in `/tests/` directory

#### Updating Styles
- Modify `/src/css/styles.css`
- Use CSS variables for theme consistency
- Test responsive design

#### Adding API Endpoints
- Update `/api/index.js`
- Add corresponding frontend calls in `/src/js/app.js`
- Update documentation

## 📱 Telegram Integration

### WebApp API Usage
- User authentication
- Theme adaptation
- Native buttons
- Payment integration
- Notifications

### Theme Variables
```css
:root {
    --tg-theme-bg-color: #1a1a2e;
    --tg-theme-text-color: #ffffff;
    --tg-theme-button-color: #007bff;
    --tg-theme-hint-color: #999999;
    --tg-theme-link-color: #2481cc;
}
```

## 🔒 Security Considerations

### API Security
- Telegram init data validation
- CORS protection
- Input sanitization
- Rate limiting

### Data Protection
- LocalStorage encryption
- Secure API communication
- User privacy protection

## 📊 Performance Optimization

### Frontend Optimization
- Minified CSS/JS
- Image optimization
- Lazy loading
- Caching strategies

### Backend Optimization
- Serverless function efficiency
- Database optimization
- Response caching
- Error handling

## 🚀 Scaling Considerations

### Database Migration
- Move from in-memory to database
- User data persistence
- Route data storage
- Transaction history

### Feature Expansion
- Social features
- Leaderboards
- Challenges
- Rewards marketplace

## 📝 Best Practices

### Code Organization
- Modular structure
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive documentation

### Git Workflow
- Feature branches
- Regular commits
- Clear commit messages
- Proper versioning

### Testing Strategy
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

---

This structure ensures maintainability, scalability, and optimal performance for the VeloPath Telegram Mini App.
