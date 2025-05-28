const fs = require('fs');
const path = require('path');

try {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  // Tenta fazer o parse do JSON
  const manifest = JSON.parse(manifestContent);
  
  // Verifica campos obrigatórios
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
  const missingFields = requiredFields.filter(field => !manifest[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Campos obrigatórios ausentes:', missingFields.join(', '));
    process.exit(1);
  }
  
  // Verifica se os ícones existem
  const iconsDir = path.join(process.cwd(), 'public');
  const missingIcons = manifest.icons.filter(icon => {
    const iconPath = path.join(iconsDir, icon.src.replace(/^\//, ''));
    return !fs.existsSync(iconPath);
  });
  
  if (missingIcons.length > 0) {
    console.error('❌ Ícones ausentes:');
    missingIcons.forEach(icon => {
      console.error(`   - ${icon.src} (${icon.sizes})`);
    });
    process.exit(1);
  }
  
  console.log('✅ manifest.json é válido!');
  console.log('✅ Todos os campos obrigatórios estão presentes');
  console.log('✅ Todos os ícones foram encontrados');
  
} catch (error) {
  if (error.name === 'SyntaxError') {
    console.error('❌ Erro de sintaxe no manifest.json:', error.message);
  } else {
    console.error('❌ Erro ao validar manifest.json:', error.message);
  }
  process.exit(1);
} 