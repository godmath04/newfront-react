import axios from 'axios';
import { ARTICLE_ENDPOINTS } from '../config/api.config';

// Servicio para gestionar articulos
class ArticleService {
  // Obtener todos los articulos publicados
  async getAllPublishedArticles() {
    try {
      const response = await axios.get(ARTICLE_ENDPOINTS.GET_ALL);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener articulos por autor
  async getArticlesByAuthor(authorId) {
    try {
      const response = await axios.get(ARTICLE_ENDPOINTS.GET_BY_AUTHOR(authorId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener un articulo por ID
  async getArticleById(id) {
    try {
      const response = await axios.get(ARTICLE_ENDPOINTS.GET_ONE(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Crear un nuevo articulo
  async createArticle(articleData) {
    try {
      const response = await axios.post(ARTICLE_ENDPOINTS.CREATE, articleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar un articulo existente
  async updateArticle(id, articleData) {
    try {
      const response = await axios.put(ARTICLE_ENDPOINTS.UPDATE(id), articleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Eliminar un articulo
  async deleteArticle(id) {
    try {
      const response = await axios.delete(ARTICLE_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Enviar articulo a revision
  async sendToReview(id) {
    try {
      const response = await axios.put(ARTICLE_ENDPOINTS.SEND_TO_REVIEW(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener articulos pendientes de revision
  async getPendingArticles() {
    try {
      const response = await axios.get(ARTICLE_ENDPOINTS.GET_PENDING);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener el nombre del estado segun su ID
  getStatusName(statusId) {
    const statusMap = {
      1: 'Borrador',
      2: 'Publicado',
      3: 'En Revision',
      4: 'Marcado'
    };
    return statusMap[statusId] || 'Desconocido';
  }

  // Obtener la clase CSS para el estado
  getStatusClass(statusId) {
    const classMap = {
      1: 'status-draft',
      2: 'status-published',
      3: 'status-review',
      4: 'status-flagged'
    };
    return classMap[statusId] || 'status-unknown';
  }

  // Verificar si el articulo puede ser editado
  canEdit(article) {
    // Solo se pueden editar articulos en borrador (1) o marcados (4)
    const editableStatuses = [1, 4];
    return editableStatuses.includes(article?.status?.idArticleStatus);
  }

  // Verificar si el articulo puede ser enviado a revision
  canSendToReview(article) {
    // Solo se pueden enviar a revision articulos en borrador (1) o marcados (4)
    const reviewableStatuses = [1, 4];
    return reviewableStatuses.includes(article?.status?.idArticleStatus);
  }

  // Verificar si el articulo puede ser eliminado
  canDelete(article) {
    // Solo se pueden eliminar articulos en borrador (1)
    return article?.status?.idArticleStatus === 1;
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
export default new ArticleService();
