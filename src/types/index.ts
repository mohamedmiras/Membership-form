export interface Submission {
  id: string;
  fullName: string;
  houseName: string;
  phoneNumber: string;
  profilePhotoUrl?: string;
  paymentScreenshotUrl: string;
  posterUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
