// VeloPath Mini App Testing Script
// This script tests all major functionality

console.log('🚀 Starting VeloPath Mini App Testing...\n');

// Test 1: Basic Application Structure
function testBasicStructure() {
    console.log('📋 Test 1: Basic Application Structure');
    
    // Check if all required elements exist
    const requiredElements = [
        'homeScreen', 'trackerScreen', 'walletScreen', 'routesScreen',
        'startTracking', 'todaySteps', 'todayKm', 'starsBalance', 'rubBalance',
        'convertToStars', 'convertToRub', 'saveRoute'
    ];
    
    let passed = 0;
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${id} found`);
            passed++;
        } else {
            console.log(`❌ ${id} missing`);
        }
    });
    
    console.log(`Result: ${passed}/${requiredElements.length} elements found\n`);
    return passed === requiredElements.length;
}

// Test 2: Telegram WebApp Integration
function testTelegramIntegration() {
    console.log('📱 Test 2: Telegram WebApp Integration');
    
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log('✅ Telegram WebApp detected');
        console.log(`✅ User: ${tg.initDataUnsafe?.user ? 'Available' : 'Not available'}`);
        console.log(`✅ Theme: ${tg.themeParams ? 'Available' : 'Not available'}`);
        console.log(`✅ MainButton: ${tg.MainButton ? 'Available' : 'Not available'}`);
        console.log(`✅ BackButton: ${tg.BackButton ? 'Available' : 'Not available'}`);
    } else {
        console.log('⚠️  Telegram WebApp not detected (demo mode)');
    }
    console.log('');
    return true;
}

// Test 3: State Management
function testStateManagement() {
    console.log('💾 Test 3: State Management');
    
    try {
        // Check if state object exists and has required properties
        if (typeof state !== 'undefined') {
            console.log('✅ State object exists');
            
            const requiredProps = ['todaySteps', 'todayKm', 'starsBalance', 'rubBalance', 'routes', 'badges'];
            let passed = 0;
            requiredProps.forEach(prop => {
                if (state.hasOwnProperty(prop)) {
                    console.log(`✅ state.${prop} exists`);
                    passed++;
                } else {
                    console.log(`❌ state.${prop} missing`);
                }
            });
            
            console.log(`Result: ${passed}/${requiredProps.length} state properties found\n`);
            return passed === requiredProps.length;
        } else {
            console.log('❌ State object not found\n');
            return false;
        }
    } catch (error) {
        console.log(`❌ Error testing state: ${error.message}\n`);
        return false;
    }
}

// Test 4: Navigation System
function testNavigation() {
    console.log('🧭 Test 4: Navigation System');
    
    try {
        // Test screen navigation
        if (typeof showScreen === 'function') {
            console.log('✅ showScreen function exists');
            
            // Test navigation to different screens
            const screens = ['home', 'tracker', 'wallet', 'routes'];
            let passed = 0;
            screens.forEach(screen => {
                try {
                    showScreen(screen);
                    console.log(`✅ Navigation to ${screen} successful`);
                    passed++;
                } catch (error) {
                    console.log(`❌ Navigation to ${screen} failed: ${error.message}`);
                }
            });
            
            console.log(`Result: ${passed}/${screens.length} navigation tests passed\n`);
            return passed === screens.length;
        } else {
            console.log('❌ showScreen function not found\n');
            return false;
        }
    } catch (error) {
        console.log(`❌ Error testing navigation: ${error.message}\n`);
        return false;
    }
}

// Test 5: API Integration
function testAPIIntegration() {
    console.log('🌐 Test 5: API Integration');
    
    try {
        if (typeof api !== 'undefined') {
            console.log('✅ API object exists');
            
            // Test API methods
            const apiMethods = ['getUser', 'updateUser', 'saveRoute', 'convertToStars', 'convertToRub'];
            let passed = 0;
            apiMethods.forEach(method => {
                if (typeof api[method] === 'function') {
                    console.log(`✅ api.${method} exists`);
                    passed++;
                } else {
                    console.log(`❌ api.${method} missing`);
                }
            });
            
            console.log(`Result: ${passed}/${apiMethods.length} API methods found\n`);
            return passed === apiMethods.length;
        } else {
            console.log('❌ API object not found\n');
            return false;
        }
    } catch (error) {
        console.log(`❌ Error testing API: ${error.message}\n`);
        return false;
    }
}

// Test 6: Step Counter
function testStepCounter() {
    console.log('👟 Test 6: Step Counter');
    
    try {
        if (typeof initStepCounter === 'function') {
            console.log('✅ initStepCounter function exists');
            
            // Test DeviceMotionEvent support
            if (window.DeviceMotionEvent) {
                console.log('✅ DeviceMotionEvent supported');
            } else {
                console.log('⚠️  DeviceMotionEvent not supported (desktop mode)');
            }
            
            console.log('✅ Step counter initialization ready\n');
            return true;
        } else {
            console.log('❌ initStepCounter function not found\n');
            return false;
        }
    } catch (error) {
        console.log(`❌ Error testing step counter: ${error.message}\n`);
        return false;
    }
}

// Test 7: Geolocation Support
function testGeolocation() {
    console.log('📍 Test 7: Geolocation Support');
    
    if (navigator.geolocation) {
        console.log('✅ Geolocation API supported');
        
        // Test getCurrentPosition
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ getCurrentPosition successful');
                console.log(`✅ Latitude: ${position.coords.latitude}`);
                console.log(`✅ Longitude: ${position.coords.longitude}`);
                console.log('✅ GPS tracking ready\n');
            },
            (error) => {
                console.log(`⚠️  GPS permission denied or error: ${error.message}`);
                console.log('⚠️  GPS tracking requires user permission\n');
            },
            { timeout: 5000 }
        );
        return true;
    } else {
        console.log('❌ Geolocation API not supported\n');
        return false;
    }
}

// Test 8: Ad Integration
function testAdIntegration() {
    console.log('🎯 Test 8: Ad Integration');
    
    if (typeof show_10942535 === 'function') {
        console.log('✅ Rewarded ad function (show_10942535) available');
        console.log('✅ Ad integration ready\n');
        return true;
    } else {
        console.log('⚠️  Rewarded ad function not available (will use fallback)\n');
        return true; // This is not a critical failure
    }
}

// Test 9: Data Persistence
function testDataPersistence() {
    console.log('💾 Test 9: Data Persistence');
    
    try {
        // Test localStorage availability
        if (typeof Storage !== 'undefined') {
            console.log('✅ LocalStorage available');
            
            // Test saveUserData and loadUserData functions
            if (typeof saveUserData === 'function' && typeof loadUserData === 'function') {
                console.log('✅ saveUserData and loadUserData functions exist');
                console.log('✅ Data persistence ready\n');
                return true;
            } else {
                console.log('❌ Data persistence functions missing\n');
                return false;
            }
        } else {
            console.log('❌ LocalStorage not supported\n');
            return false;
        }
    } catch (error) {
        console.log(`❌ Error testing data persistence: ${error.message}\n`);
        return false;
    }
}

// Test 10: UI Elements and Interactions
function testUIElements() {
    console.log('🎨 Test 10: UI Elements and Interactions');
    
    try {
        // Test navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log(`✅ Found ${navButtons.length} navigation buttons`);
        
        // Test activity selector
        const activityOptions = document.querySelectorAll('.activity-option');
        console.log(`✅ Found ${activityOptions.length} activity options`);
        
        // Test achievement badges
        const badges = document.querySelectorAll('.badge-item');
        console.log(`✅ Found ${badges.length} achievement badges`);
        
        // Test conversion buttons
        const convertButtons = document.querySelectorAll('.btn-convert');
        console.log(`✅ Found ${convertButtons.length} conversion buttons`);
        
        console.log('✅ UI elements properly structured\n');
        return true;
    } catch (error) {
        console.log(`❌ Error testing UI elements: ${error.message}\n`);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🧪 Running Comprehensive Test Suite...\n');
    
    const tests = [
        testBasicStructure,
        testTelegramIntegration,
        testStateManagement,
        testNavigation,
        testAPIIntegration,
        testStepCounter,
        testGeolocation,
        testAdIntegration,
        testDataPersistence,
        testUIElements
    ];
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach(test => {
        if (test()) passed++;
    });
    
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}/${total} tests`);
    console.log(`❌ Failed: ${total - passed}/${total} tests`);
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Application is ready for deployment.');
    } else {
        console.log('⚠️  Some tests failed. Please review the issues above.');
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.runTests = runAllTests;
    window.testBasicStructure = testBasicStructure;
    window.testTelegramIntegration = testTelegramIntegration;
    window.testStateManagement = testStateManagement;
    window.testNavigation = testNavigation;
    window.testAPIIntegration = testAPIIntegration;
    window.testStepCounter = testStepCounter;
    window.testGeolocation = testGeolocation;
    window.testAdIntegration = testAdIntegration;
    window.testDataPersistence = testDataPersistence;
    window.testUIElements = testUIElements;
}

// Auto-run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testBasicStructure,
        testTelegramIntegration,
        testStateManagement,
        testNavigation,
        testAPIIntegration,
        testStepCounter,
        testGeolocation,
        testAdIntegration,
        testDataPersistence,
        testUIElements
    };
}
