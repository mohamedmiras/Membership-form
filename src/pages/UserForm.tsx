import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generatePoster, fileToDataUrl } from '../utils/posterGenerator';
import { saveSubmission } from '../utils/storage';
import ImageCropper from '../components/ImageCropper';
import heic2any from 'heic2any';

const PAYMENT_AMOUNT = '300'; // Easily configurable amount
const UPI_ID = 'mirasmt.mt@okicici'; // Replace with your actual UPI ID
const UPI_NAME = 'Miras MT'; // Updated Name

export default function UserForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    houseName: '',
    phoneNumber: '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [photoToCrop, setPhotoToCrop] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const uniqueId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderId(uniqueId);
  }, []);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const paymentInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'payment') => {
    let file = e.target.files?.[0];
    if (file) {
      if (type === 'payment') {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          setError('Payment screenshot must be a JPG, PNG, or WEBP image.');
          e.target.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Payment screenshot must be less than 5MB.');
          e.target.value = '';
          return;
        }
      }
      try {
        // Convert HEIC/HEIF (iPhone photos) to JPEG to prevent black screen/rendering issues
        const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
        if (isHeic) {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          file = new File([blobToUse], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
        }

        if (type === 'photo') {
          // Use Object URL for cropper preview (faster, uses less memory than base64)
          setPhotoToCrop(URL.createObjectURL(file));
        } else {
          setPaymentScreenshot(file);
        }
      } catch (err) {
        console.error("File processing error:", err);
        setError(`Failed to process the ${type === 'photo' ? 'profile photo' : 'payment screenshot'}. Please try a standard JPG/PNG image.`);
      }
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "cropped-profile.jpg", { type: "image/jpeg" });
    setProfilePhoto(croppedFile);
    setPhotoToCrop(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !paymentScreenshot) {
      setError('Please fill in your name and upload the payment screenshot.');
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Convert profile photo to data URL for the poster generator
      const photoDataUrl = profilePhoto ? await fileToDataUrl(profilePhoto) : null;

      // 2. Load template image (Assuming we put it in public folder as template.png)
      // Since it's public, we just use '/template.png'
      const templateSrc = '/template.png';

      // 3. Generate Poster
      const posterDataUrl = await generatePoster(
        templateSrc,
        photoDataUrl,
        formData.fullName,
        formData.houseName
      );

      // 4. Save Submission directly to Firebase
      // Firebase will generate the real document ID, so we don't need to create one here
      await saveSubmission({
        ...formData,
        orderId,
        profilePhotoFile: profilePhoto,
        paymentScreenshotFile: paymentScreenshot,
        posterDataUrl,
      });

      // 5. Navigate to Success
      navigate('/success', { state: { posterDataUrl } });

    } catch (err) {
      console.error(err);
      setError('Failed to generate poster. Please make sure the template.png exists in the public folder and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {photoToCrop && (
        <ImageCropper 
          imageSrc={photoToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setPhotoToCrop(null);
            if (photoInputRef.current) photoInputRef.current.value = '';
          }}
        />
      )}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#f0eee9]">
        <div className="bg-primary px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white relative z-10 mb-2">Join Our Community</h2>
          <p className="text-primary-light text-opacity-90 relative z-10 font-medium">Generate your official membership poster instantly</p>
        </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-dark border-b pb-2">Personal Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 outline-none"
                  placeholder="e.g. Mohammed Ali"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">House Name</label>
                <input 
                  type="text" 
                  name="houseName"
                  value={formData.houseName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 outline-none"
                  placeholder="e.g. Darul Falah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 outline-none"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Uploads & Profile */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-dark border-b pb-2">Profile Photo</h3>

            <div className="space-y-5">
              {/* Profile Photo */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${profilePhoto ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
                onClick={() => photoInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  ref={photoInputRef}
                  onChange={(e) => handleFileChange(e, 'photo')}
                />
                {profilePhoto ? (
                  <div className="flex flex-col items-center space-y-2">
                    <CheckCircle className="text-primary w-8 h-8" />
                    <span className="text-sm font-medium text-gray-700">{profilePhoto.name}</span>
                    <span className="text-xs text-primary font-semibold">Change Photo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-gray-500">
                    <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Upload Profile Photo *</span>
                    <span className="text-xs">Square image recommended</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-6 border-t pt-8">
          <h3 className="text-lg font-semibold text-primary-dark border-b pb-2">Secure Payment</h3>
          
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 shadow-inner flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1 w-full text-center md:text-left space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Registration Fee</p>
                <h4 className="text-4xl font-bold text-gray-900">₹{PAYMENT_AMOUNT}</h4>
                <p className="text-sm text-gray-500 mt-2 font-mono bg-white inline-block px-3 py-1 rounded-md border border-gray-100 shadow-sm">Order ID: {orderId}</p>
              </div>
              <p className="text-gray-600 text-sm">Pay securely using Google Pay. Scan the QR code or tap the button below if you are on a mobile device.</p>
              <p className="text-sm font-medium text-gray-600 mt-1">GPay Number: <span className="font-bold text-gray-900">9447397075</span></p>
              
              <div className="pt-4 w-full md:w-auto">
                <a 
                  href={`gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${PAYMENT_AMOUNT}&cu=INR&tn=${orderId}`}
                  onClick={(e) => {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    const isAndroid = /Android/i.test(navigator.userAgent);
                    
                    if (!isMobile) {
                      e.preventDefault();
                      alert("UPI apps cannot be opened on desktop. Please scan the QR Code on the right with your phone's GPay or UPI app to pay.");
                    } else if (isAndroid) {
                      // On Android, use the standard UPI intent to ensure it works across all Android versions
                      e.currentTarget.href = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${PAYMENT_AMOUNT}&cu=INR&tn=${orderId}`;
                    }
                  }}
                  className="w-full md:w-auto px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 shadow-md"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6 filter brightness-0 invert" />
                  Pay with GPay
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${PAYMENT_AMOUNT}&cu=INR&tn=${orderId}`} size={160} />
              <p className="text-sm font-bold text-gray-600">Scan to Pay</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Upload Payment Proof *</p>
            {/* Payment Screenshot */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${paymentScreenshot ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
              onClick={() => paymentInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
                ref={paymentInputRef}
                onChange={(e) => handleFileChange(e, 'payment')}
              />
              {paymentScreenshot ? (
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="text-green-500 w-8 h-8" />
                  <span className="text-sm font-medium text-gray-700">{paymentScreenshot.name}</span>
                  <span className="text-xs text-green-600 font-semibold">Change Screenshot</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-gray-500">
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Upload Payment Screenshot</span>
                  <span className="text-xs">Max 5MB (JPG, PNG, WEBP)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t mt-8">
          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg ${
              isGenerating ? 'bg-primary-dark cursor-not-allowed opacity-90' : 'bg-primary hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-1'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Generating Premium Poster...</span>
              </>
            ) : (
              <span>Generate My Poster</span>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
