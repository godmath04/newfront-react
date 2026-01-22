import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import approvalService from '../../services/approval.service';
import './ArticleDetail.css';

// Componente para mostrar el detalle de un articulo
const ArticleDetail = () => {
  const [article, setArticle] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Cargar articulo y historial de aprobaciones al montar
  useEffect(() => {
    loadArticleData();
  }, [id]);

  // Funcion para cargar los datos del articulo
  const loadArticleData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar articulo
      const articleData = await articleService.getArticleById(id);
      setArticle(articleData);

      // Cargar historial de aprobaciones
      try {
        const history = await approvalService.getApprovalHistory(id);
        setApprovalHistory(history);
      } catch (historyError) {
        // Si no hay historial, no es un error critico
        console.log('No se encontro historial de aprobaciones');
        setApprovalHistory([]);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el articulo');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario es el autor del articulo
  const isAuthor = () => {
    return article?.author?.idUser === user?.userId;
  };

  // Navegar a editar
  const handleEdit = () => {
    navigate(`/articles/edit/${id}`);
  };

  // Mostrar modal de confirmacion para eliminar
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Confirmar eliminacion
  const confirmDelete = async () => {
    try {
      await articleService.deleteArticle(id);
      setShowDeleteModal(false);
      navigate('/articles');
    } catch (err) {
      setError(err.message || 'Error al eliminar el articulo');
      setShowDeleteModal(false);
    }
  };

  // Cancelar eliminacion
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Enviar a revision
  const handleSendToReview = async () => {
    try {
      setError('');
      await articleService.sendToReview(id);
      setSuccessMessage('Articulo enviado a revision correctamente');
      // Recargar datos
      loadArticleData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al enviar el articulo a revision');
    }
  };

  // Volver a la lista
  const handleBack = () => {
    navigate('/articles');
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener nombre del autor
  const getAuthorName = () => {
    if (!article?.author) return 'Desconocido';
    const { firstName, lastName, username } = article.author;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return username || 'Desconocido';
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="article-detail-container">
        <nav className="article-detail-nav">
          <div className="nav-left">
            <button onClick={handleBack} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Detalle del Articulo</h1>
          </div>
        </nav>
        <div className="article-detail-content">
          <div className="loading-state">Cargando articulo...</div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error && !article) {
    return (
      <div className="article-detail-container">
        <nav className="article-detail-nav">
          <div className="nav-left">
            <button onClick={handleBack} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Detalle del Articulo</h1>
          </div>
        </nav>
        <div className="article-detail-content">
          <div className="error-card">
            <div className="error-message">{error}</div>
            <button onClick={handleBack} className="back-link">
              Volver a Mis Articulos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-container">
      <nav className="article-detail-nav">
        <div className="nav-left">
          <button onClick={handleBack} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Detalle del Articulo</h1>
        </div>
        {isAuthor() && (
          <div className="nav-actions">
            {articleService.canEdit(article) && (
              <button onClick={handleEdit} className="action-btn edit-btn">
                Editar
              </button>
            )}
            {articleService.canSendToReview(article) && (
              <button onClick={handleSendToReview} className="action-btn review-btn">
                Enviar a Revision
              </button>
            )}
            {articleService.canDelete(article) && (
              <button onClick={handleDeleteClick} className="action-btn delete-btn">
                Eliminar
              </button>
            )}
          </div>
        )}
      </nav>

      <div className="article-detail-content">
        {/* Mensajes */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Contenido del articulo */}
        <div className="article-card">
          <div className="article-header">
            <h2 className="article-title">{article?.title}</h2>
            <span className={`status-badge ${articleService.getStatusClass(article?.status?.idArticleStatus)}`}>
              {article?.status?.statusName || articleService.getStatusName(article?.status?.idArticleStatus)}
            </span>
          </div>

          <div className="article-meta">
            <div className="meta-item">
              <span className="meta-label">Autor:</span>
              <span className="meta-value">{getAuthorName()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Fecha de creacion:</span>
              <span className="meta-value">{formatDate(article?.createdAt)}</span>
            </div>
            {article?.updatedAt && (
              <div className="meta-item">
                <span className="meta-label">Ultima actualizacion:</span>
                <span className="meta-value">{formatDate(article?.updatedAt)}</span>
              </div>
            )}
          </div>

          <div className="article-content">
            <h3>Contenido</h3>
            <div className="content-text">
              {article?.content?.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Historial de aprobaciones */}
        {approvalHistory.length > 0 && (
          <div className="approval-history-card">
            <h3>Historial de Aprobaciones</h3>
            <div className="approval-timeline">
              {approvalHistory.map((approval, index) => (
                <div key={index} className={`approval-item ${approval.status?.toLowerCase()}`}>
                  <div className="approval-icon">
                    {approval.status === 'APPROVED' ? '✓' : '✗'}
                  </div>
                  <div className="approval-details">
                    <div className="approval-header">
                      <span className="approver-name">{approval.approverUsername || 'Usuario'}</span>
                      <span className={`approval-status ${approval.status?.toLowerCase()}`}>
                        {approval.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                      </span>
                    </div>
                    <div className="approval-role">{approval.roleName || 'Rol desconocido'}</div>
                    {approval.comments && (
                      <div className="approval-comments">
                        <span className="comments-label">Comentarios:</span> {approval.comments}
                      </div>
                    )}
                    <div className="approval-date">{formatDate(approval.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmacion para eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminacion</h3>
            <p>¿Esta seguro que desea eliminar el articulo "{article?.title}"?</p>
            <p className="modal-warning">Esta accion no se puede deshacer.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="modal-button cancel-button">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="modal-button confirm-button">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
