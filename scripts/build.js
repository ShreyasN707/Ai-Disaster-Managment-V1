#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function executeCommand(command, cwd = process.cwd()) {
  try {
    log(`Executing: ${command}`, colors.cyan);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    return true;
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`, colors.green);
  }
}

async function buildProject() {
  const rootDir = path.resolve(__dirname, '..');
  const frontendDir = path.join(rootDir, 'frontend');
  const distDir = path.join(frontendDir, 'dist');
  const uploadsDir = path.join(rootDir, 'uploads');

  log('🚀 Starting AI Disaster Management System Build', colors.bright + colors.blue);
  log('=' .repeat(60), colors.blue);

  // Step 1: Check prerequisites
  log('\n📋 Step 1: Checking prerequisites...', colors.yellow);
  
  if (!checkFileExists(path.join(rootDir, 'package.json'))) {
    log('❌ Backend package.json not found', colors.red);
    process.exit(1);
  }

  if (!checkFileExists(path.join(frontendDir, 'package.json'))) {
    log('❌ Frontend package.json not found', colors.red);
    process.exit(1);
  }

  log('✅ Prerequisites check passed', colors.green);

  // Step 2: Install backend dependencies
  log('\n📦 Step 2: Installing backend dependencies...', colors.yellow);
  if (!executeCommand('npm install', rootDir)) {
    log('❌ Failed to install backend dependencies', colors.red);
    process.exit(1);
  }
  log('✅ Backend dependencies installed', colors.green);

  // Step 3: Install frontend dependencies
  log('\n📦 Step 3: Installing frontend dependencies...', colors.yellow);
  if (!executeCommand('npm install', frontendDir)) {
    log('❌ Failed to install frontend dependencies', colors.red);
    process.exit(1);
  }
  log('✅ Frontend dependencies installed', colors.green);

  // Step 4: Build frontend
  log('\n🏗️  Step 4: Building frontend...', colors.yellow);
  if (!executeCommand('npm run build', frontendDir)) {
    log('❌ Failed to build frontend', colors.red);
    process.exit(1);
  }

  if (!checkFileExists(distDir)) {
    log('❌ Frontend build output not found', colors.red);
    process.exit(1);
  }
  log('✅ Frontend built successfully', colors.green);

  // Step 5: Create necessary directories
  log('\n📁 Step 5: Creating necessary directories...', colors.yellow);
  createDirectory(uploadsDir);
  log('✅ Directories created', colors.green);

  // Step 6: Copy environment configuration
  log('\n⚙️  Step 6: Setting up environment configuration...', colors.yellow);
  const envExample = path.join(rootDir, '.env.example');
  const envFile = path.join(rootDir, '.env');
  
  if (!checkFileExists(envFile) && checkFileExists(envExample)) {
    fs.copyFileSync(envExample, envFile);
    log('📝 Created .env from .env.example', colors.cyan);
    log('⚠️  Please update .env with your configuration', colors.yellow);
  }

  const frontendEnvExample = path.join(frontendDir, '.env.example');
  const frontendEnvFile = path.join(frontendDir, '.env');
  
  if (!checkFileExists(frontendEnvFile) && checkFileExists(frontendEnvExample)) {
    fs.copyFileSync(frontendEnvExample, frontendEnvFile);
    log('📝 Created frontend .env from .env.example', colors.cyan);
  }

  log('✅ Environment configuration ready', colors.green);

  // Step 7: Validate build
  log('\n🔍 Step 7: Validating build...', colors.yellow);
  
  const indexHtml = path.join(distDir, 'index.html');
  if (!checkFileExists(indexHtml)) {
    log('❌ Frontend index.html not found in build output', colors.red);
    process.exit(1);
  }

  const packageJson = require(path.join(rootDir, 'package.json'));
  log(`📋 Project: ${packageJson.name} v${packageJson.version}`, colors.cyan);
  log(`📁 Frontend build size: ${getFolderSize(distDir)} MB`, colors.cyan);
  
  log('✅ Build validation passed', colors.green);

  // Step 8: Generate build info
  log('\n📄 Step 8: Generating build information...', colors.yellow);
  
  const buildInfo = {
    name: packageJson.name,
    version: packageJson.version,
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    environment: 'production',
    components: {
      backend: {
        main: 'src/server.js',
        dependencies: Object.keys(packageJson.dependencies || {}).length
      },
      frontend: {
        framework: 'React + TypeScript + Vite',
        buildDir: 'frontend/dist'
      },
      ml: {
        model: 'TensorFlow.js U-Net',
        modelPath: './tfjs_model'
      }
    }
  };

  fs.writeFileSync(
    path.join(rootDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  log('✅ Build information generated', colors.green);

  // Success message
  log('\n🎉 Build completed successfully!', colors.bright + colors.green);
  log('=' .repeat(60), colors.green);
  log('\n📋 Next steps:', colors.yellow);
  log('1. Update .env with your configuration', colors.cyan);
  log('2. Set up MongoDB database', colors.cyan);
  log('3. Train and export ML model (optional)', colors.cyan);
  log('4. Start the server: npm start', colors.cyan);
  log('\n🌐 The application will serve both API and frontend on the same port.', colors.blue);
}

function getFolderSize(folderPath) {
  let totalSize = 0;
  
  function calculateSize(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  try {
    calculateSize(folderPath);
    return (totalSize / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return '0.00';
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('AI Disaster Management System Build Script', colors.bright);
  log('\nUsage: node scripts/build.js [options]', colors.cyan);
  log('\nOptions:', colors.yellow);
  log('  --help, -h    Show this help message', colors.cyan);
  log('  --verbose     Enable verbose output', colors.cyan);
  process.exit(0);
}

// Run the build
buildProject().catch(error => {
  log('\n❌ Build failed:', colors.red);
  log(error.message, colors.red);
  process.exit(1);
});
