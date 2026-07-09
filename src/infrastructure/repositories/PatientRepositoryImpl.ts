import type { Patient } from '../../core/entities/Patient';
import type { PatientRepository } from '../../core/ports/PatientRepository';
import axiosClient from '../api/axiosClient';

/**
 * Mapea la respuesta del backend (PatientWithUser) a la entidad Patient del frontend.
 *
 * Backend devuelve:
 *   { id, userId, nutritionistUserId, status, phone, birthDate, gender, deletedAt, createdAt,
 *     user: { id, email, name } }
 *
 * Lo mapeamos a:
 *   { id, name, email, phone, birthDate, gender, createdAt, nutritionistId, status, deletedAt }
 */
function mapPatient(raw: Record<string, unknown>): Patient {
  const user = (raw.user as Record<string, unknown>) ?? {};

  return {
    id: String(raw.id ?? ''),
    name: String(user.name ?? raw.name ?? ''),
    email: String(user.email ?? raw.email ?? ''),
    phone: raw.phone ? String(raw.phone) : null,
    birthDate: raw.birthDate ? String(raw.birthDate) : null,
    gender: (raw.gender as Patient['gender']) ?? null,
    createdAt: String(raw.createdAt ?? ''),
    nutritionistId: raw.nutritionistUserId
      ? String(raw.nutritionistUserId)
      : null,
    status: raw.status ? String(raw.status) : null,
    deletedAt: raw.deletedAt ? String(raw.deletedAt) : null,
  };
}

export const patientRepository: PatientRepository = {
  async getAllByNutritionist(nutritionistId) {
    const { data } = await axiosClient.get('/v1/patients');
    const patients: Patient[] = Array.isArray(data?.data) ? data.data.map(mapPatient) : (Array.isArray(data) ? data.map(mapPatient) : []);
    return patients.filter((p) => !p.deletedAt);
  },

  async getPendingRegistrations() {
    const { data } = await axiosClient.get('/v1/patients/pending');
    const patients: Patient[] = Array.isArray(data?.data) ? data.data.map(mapPatient) : (Array.isArray(data) ? data.map(mapPatient) : []);
    return patients.filter((p) => !p.nutritionistId && !p.deletedAt);
  },

  async getById(id, _nutritionistId) {
    const { data } = await axiosClient.get(`/v1/patients/${id}`);
    const raw = data?.data ?? data;
    return raw ? mapPatient(raw as Record<string, unknown>) : undefined;
  },

  async create(input) {
    const { data } = await axiosClient.post('/v1/patients', {
      email: input.email,
      password: input.password,
      name: input.name,
      phone: input.phone,
      birthDate: input.birthDate,
      gender: input.gender,
    });

    const raw = data?.data ?? data;
    return mapPatient(raw as Record<string, unknown>);
  },

  async update(id, updates) {
    const { data } = await axiosClient.patch(`/v1/patients/${id}`, {
      name: updates.name,
      phone: updates.phone,
      birthDate: updates.birthDate,
      gender: updates.gender,
    });

    const raw = data?.data ?? data;
    return mapPatient(raw as Record<string, unknown>);
  },

  async assignToNutritionist(id) {
    const { data } = await axiosClient.post(`/v1/patients/${id}/approve`);
    const raw = data?.data ?? data;
    return mapPatient(raw as Record<string, unknown>);
  },

  async delete(id) {
    await axiosClient.delete(`/v1/patients/${id}`);
  },
};