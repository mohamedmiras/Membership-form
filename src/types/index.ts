export interface Submission {
  id: string;
  fullName: string;
  houseName: string;
  phoneNumber: string;
  profilePhotoDataUrl: string;
  paymentScreenshotDataUrl: string;
  posterDataUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
