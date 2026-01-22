import axios from 'axios';
import { APPROVAL_ENDPOINTS } from '../config/api.config';

// Servicio para gestionar aprobaciones de articulos
class ApprovalService {
  // Obtener aprobaciones pendientes
  async getPendingApprovals() {
    try {
      const response = await axios.get(APPROVAL_ENDPOINTS.GET_PENDING);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Procesar una aprobacion (aprobar o rechazar)
  async processApproval(approvalRequest) {
    try {
      const response = await axios.post(APPROVAL_ENDPOINTS.PROCESS, approvalRequest);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener historial de aprobaciones de un articulo
  async getApprovalHistory(articleId) {
    try {
      const response = await axios.get(APPROVAL_ENDPOINTS.GET_HISTORY(articleId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Manejar errores de la API
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data || 'Error al procesar la solicitud';
      return new Error(message);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error(error.message || 'Error desconocido');
    }
  }
}

// Exportar instancia singleton
export default new ApprovalService();
