export const generatePoster = async (
  templateSrc: string,
  profilePhotoSrc: string,
  fullName: string,
  houseName: string,
  phoneNumber: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    const templateImg = new Image();
    templateImg.crossOrigin = 'Anonymous';
    
    templateImg.onload = () => {
      // Set canvas size to match template
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;

      // Draw background
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      // Load profile photo
      const profileImg = new Image();
      
      profileImg.onload = () => {
        // --- Configuration ---
        // Using percentages relative to canvas dimensions for perfect scaling
        const photoDiameter = canvas.width * 0.39; // Enlarged diameter to fit perfectly
        const radius = photoDiameter / 2;
        const centerX = canvas.width / 2;
        // Move slightly UP to perfectly cover the white circle on the template
        const centerY = canvas.height * 0.215 + radius; 
        
        // Draw subtle shadow behind photo
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = canvas.width * 0.015;
        ctx.shadowOffsetY = canvas.width * 0.005;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();

        // Draw Photo with clean circular crop
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip(); // Mask image
        
        // Use object-fit: cover behavior (fit within the circle's bounding box)
        const imgScale = Math.max(photoDiameter / profileImg.width, photoDiameter / profileImg.height);
        const x = centerX - (profileImg.width * imgScale) / 2;
        const y = centerY - (profileImg.height * imgScale) / 2;
        ctx.drawImage(profileImg, x, y, profileImg.width * imgScale, profileImg.height * imgScale);
        ctx.restore();

        // --- Draw Professional Circular Border ---
        ctx.save();
        // Crisp white outer border
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = canvas.width * 0.012; 
        ctx.strokeStyle = '#FFFFFF'; 
        ctx.stroke();
        
        // Elegant gold inner border for premium Islamic feel
        ctx.beginPath();
        const inset = canvas.width * 0.006; // Inset by half the white border width
        ctx.arc(centerX, centerY, radius - inset, 0, Math.PI * 2);
        ctx.lineWidth = canvas.width * 0.002;
        ctx.strokeStyle = '#D4AF37'; // Premium Gold
        ctx.stroke();
        ctx.restore();

        // --- Draw Text ---
        ctx.textAlign = 'center';
        
        // Full Name
        ctx.font = `bold ${canvas.width * 0.055}px 'Montserrat', sans-serif`; 
        ctx.fillStyle = '#0F172A'; // Dark navy/black
        const nameY = canvas.height * 0.575; // Locked to exact absolute position
        ctx.fillText(fullName.toUpperCase(), canvas.width / 2, nameY);

        // House Name
        let houseNameY = nameY;
        if (houseName) {
          ctx.font = `500 ${canvas.width * 0.024}px 'Montserrat', sans-serif`;
          ctx.fillStyle = '#6B7280'; // Medium gray
          houseNameY = nameY + (canvas.height * 0.025);
          ctx.fillText(houseName, canvas.width / 2, houseNameY);
        }

        // Phone Number
        if (phoneNumber) {
          ctx.font = `500 ${canvas.width * 0.018}px 'Montserrat', sans-serif`;
          ctx.fillStyle = '#9CA3AF'; // Light gray styling
          const phoneY = houseNameY + (canvas.height * 0.02);
          ctx.fillText(phoneNumber, canvas.width / 2, phoneY);
        }

        // Phone Number (Optional)
        // Removed duplicate block

        resolve(canvas.toDataURL('image/png', 1.0));
      };

      profileImg.onerror = () => reject(new Error('Failed to load profile photo'));
      profileImg.src = profilePhotoSrc;
    };

    templateImg.onerror = () => reject(new Error('Failed to load template image'));
    templateImg.src = templateSrc;
  });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
