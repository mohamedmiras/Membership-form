export const generatePoster = async (
  templateSrc: string,
  profilePhotoSrc: string | null,
  fullName: string,
  houseName: string
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

      // --- Configuration ---
      // Using percentages relative to canvas dimensions for perfect scaling
      const photoDiameter = canvas.width * 0.39; // Enlarged diameter to fit perfectly
      const radius = photoDiameter / 2;
      const centerX = canvas.width / 2;
      // Move slightly UP to perfectly cover the white circle on the template
      const centerY = canvas.height * 0.215 + radius; 
      
      // Draw subtle shadow behind photo/avatar
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = canvas.width * 0.015;
      ctx.shadowOffsetY = canvas.width * 0.005;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      const drawBorderAndText = () => {
        // --- Draw Professional Circular Border ---
        ctx.save();
        // Crisp white outer border
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = canvas.width * 0.012; 
        ctx.strokeStyle = '#FFFFFF'; 
        ctx.stroke();
        
        // Elegant gold inner border for premium Muslimeen feel
        ctx.beginPath();
        const inset = canvas.width * 0.006; // Inset by half the white border width
        ctx.arc(centerX, centerY, radius - inset, 0, Math.PI * 2);
        ctx.lineWidth = canvas.width * 0.002;
        ctx.strokeStyle = '#D4AF37'; // Premium Gold
        ctx.stroke();
        ctx.restore();

        // --- Draw Text ---
        ctx.textAlign = 'center';
        
        // Full Name - Premium sizing
        ctx.font = `800 ${canvas.width * 0.048}px 'Montserrat', sans-serif`; 
        ctx.fillStyle = '#0F172A'; // Dark navy/black
        
        // Dynamically calculate text position
        const circleBottomY = centerY + radius;
        const spaceBetweenPhotoAndName = canvas.height * 0.052; // Space A
        const nameY = circleBottomY + spaceBetweenPhotoAndName;
        
        ctx.fillText(fullName.toUpperCase(), canvas.width / 2, nameY);

        if (houseName) {
          ctx.font = `500 ${canvas.width * 0.022}px 'Montserrat', sans-serif`;
          ctx.fillStyle = '#6B7280'; // Medium gray
          
          // Space B should be half of Space A
          const spaceBetweenNames = spaceBetweenPhotoAndName / 2;
          const houseNameY = nameY + spaceBetweenNames;
          ctx.fillText(houseName, canvas.width / 2, houseNameY);
        }

        resolve(canvas.toDataURL('image/png', 1.0));
      };

      if (profilePhotoSrc) {
        // Load profile photo
        const profileImg = new Image();
        profileImg.onload = () => {
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

          drawBorderAndText();
        };

        profileImg.onerror = () => reject(new Error('Failed to load profile photo'));
        profileImg.src = profilePhotoSrc;
      } else {
        // Draw a clean premium default user/avatar icon
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Background for the avatar - modern slate/gray gradient
        const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        gradient.addColorStop(0, '#F1F5F9');
        gradient.addColorStop(1, '#CBD5E1');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Avatar silhouette color
        ctx.fillStyle = '#94A3B8';

        // Head (circle)
        ctx.beginPath();
        const headRadius = radius * 0.3;
        const headCenterY = centerY - radius * 0.15;
        ctx.arc(centerX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Shoulders/Body (half ellipse/arc)
        ctx.beginPath();
        const bodyRadius = radius * 0.65;
        const bodyCenterY = centerY + radius * 0.7;
        ctx.arc(centerX, bodyCenterY, bodyRadius, Math.PI, 0);
        ctx.fill();

        ctx.restore();

        drawBorderAndText();
      }
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
