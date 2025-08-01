// Simple test to verify Component Registry integration
import { componentRegistry } from './component-registry';

async function testComponentRegistry() {
  console.log('🧪 Testing Component Registry integration...');
  
  try {
    // Test Hero Variation 1
    console.log('📦 Testing Hero Variation 1 export...');
    const heroExports = await componentRegistry.getComponentExports('hero', 1);
    
    if (heroExports?.classMaps && heroExports?.metadata) {
      console.log('✅ Hero Variation 1 loaded successfully!');
      console.log('🎯 Component Type:', heroExports.metadata.componentType);
      console.log('🔢 Variation Number:', heroExports.metadata.variationNumber);
      console.log('📋 Elements:', heroExports.metadata.elements);
      console.log('🎨 Class Maps keys:', Object.keys(heroExports.classMaps));
    } else {
      console.log('⚠️ Hero Variation 1 exports incomplete');
    }
    
    // Test CTA Variation 2
    console.log('\n📦 Testing CTA Variation 2 export...');
    const ctaExports = await componentRegistry.getComponentExports('cta', 2);
    
    if (ctaExports?.classMaps && ctaExports?.metadata) {
      console.log('✅ CTA Variation 2 loaded successfully!');
      console.log('🎯 Component Type:', ctaExports.metadata.componentType);
      console.log('🔢 Variation Number:', ctaExports.metadata.variationNumber);
      console.log('📋 Elements:', ctaExports.metadata.elements);
      console.log('🎨 Class Maps keys:', Object.keys(ctaExports.classMaps));
    } else {
      console.log('⚠️ CTA Variation 2 exports incomplete');
    }
    
    // Test available component types
    console.log('\n📊 Available component types:', componentRegistry.getAvailableComponentTypes());
    console.log('📊 Available hero variations:', componentRegistry.getAvailableVariations('hero'));
    console.log('📊 Available CTA variations:', componentRegistry.getAvailableVariations('cta'));
    
    console.log('\n🎉 Component Registry integration test completed!');
    
  } catch (error) {
    console.error('❌ Component Registry test failed:', error);
  }
}

// Run the test
testComponentRegistry();
