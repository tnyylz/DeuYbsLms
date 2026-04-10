import axiosInstance from './axiosInstance';
import type { CertificateDto } from '../types';

export const getMyCertificatesApi = async (): Promise<CertificateDto[]> => {
  const { data } = await axiosInstance.get<CertificateDto[]>('/Certificate/my-certificates');
  return data;
};

export const generateCertificateApi = async (enrollmentId: string): Promise<CertificateDto> => {
  const { data } = await axiosInstance.post<CertificateDto>(`/Certificate/generate/${enrollmentId}`);
  return data;
};

export const verifyCertificateApi = async (code: string): Promise<CertificateDto> => {
  const { data } = await axiosInstance.get<CertificateDto>(`/Certificate/verify/${code}`);
  return data;
};
