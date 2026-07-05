interface RecalculateMetricsPayload {
  patientId: string;
  recordId: string;
}

// Placeholder para backend: hoy solo simula una llamada asíncrona.
export const clinicalRecordApi = {
  async recalculateMetrics(payload: RecalculateMetricsPayload): Promise<void> {
    void payload;
    await new Promise((resolve) => setTimeout(resolve, 400));
  },
};
