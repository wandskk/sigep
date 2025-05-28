const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconSizes = sizes.map(size => ({
  width: size,
  height: size,
  name: `icon-${size}x${size}.png`
}));

// Certifique-se de que o diretório icons existe
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Função para gerar um ícone de uma cor sólida com texto
async function generateIcon(size, color = '#000000', textColor = '#ffffff') {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size/4}px" fill="${textColor}" text-anchor="middle" dy=".3em">SIGEP</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateIcons() {
  try {
    console.log('🎨 Gerando ícones...');

    for (const size of iconSizes) {
      const svgBuffer = await generateIcon(size.width);
      const outputPath = path.join(iconsDir, size.name);
      
      await sharp(svgBuffer)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Gerado: ${size.name}`);
    }

    // Gerar ícone maskable
    const maskableSize = 512;
    const svgBuffer = await generateIcon(maskableSize, '#000000', '#ffffff');
    const maskablePath = path.join(iconsDir, 'maskable-icon-512x512.png');
    
    await sharp(svgBuffer)
      .png()
      .toFile(maskablePath);
    
    console.log('✅ Gerado: maskable-icon-512x512.png');
    console.log('\n✨ Todos os ícones foram gerados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons(); 