import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import approvalService from '../../services/approval.service';
import './ApprovalList.css';

// Componente para listar articulos pendientes de aprobacion
const ApprovalList = () => {
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Map para rastrear que articulos ya fueron revisados por el rol del usuario
  const [articleReviewedByRole, setArticleReviewedByRole] = useState({});

  // Estado para el modal de aprobacion
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [approvalData, setApprovalData] = useState({
    status: '',
    comments: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, getUserRole } = useAuth();
  const navigate = useNavigate();
  const userRole = getUserRole();

  // Cargar articulos pendientes al montar el componente
  useEffect(() => {
    loadPendingArticles();
  }, []);

  // Funcion para cargar los articulos pendientes
  const loadPendingArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await articleService.getPendingArticles();
      setPendingArticles(data);

      // Verificar historial de aprobaciones para cada articulo
      await checkApprovalHistory(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los articulos pendientes');
      setLoading(false);
    }
  };

  // Verificar el historial de aprobaciones para saber si el rol ya reviso
  const checkApprovalHistory = async (articles) => {
    if (articles.length === 0) {
      setLoading(false);
      return;
    }

    const reviewedMap = {};

    // Verificar cada articulo en paralelo
    const promises = articles.map(async (article) => {
      try {
        const history = await approvalService.getApprovalHistory(article.idArticle);
        // Verificar si el rol del usuario actual ya reviso este articulo
        const hasReviewed = history.some(
          approval => approval.roleName === userRole
        );
        reviewedMap[article.idArticle] = hasReviewed;
      } catch (err) {
        // Si hay error al obtener historial, asumir que no ha revisado
        console.log(`No se pudo obtener historial del articulo ${article.idArticle}`);
        reviewedMap[article.idArticle] = false;
      }
    });

    await Promise.all(promises);
    setArticleReviewedByRole(reviewedMap);
    setLoading(false);
  };

  // Verificar si el rol del usuario ya reviso un articulo
  const hasUserRoleReviewedArticle = (articleId) => {
    return articleReviewedByRole[articleId] || false;
  };

  // Abrir modal de aprobacion
  const handleOpenApprovalModal = (article) => {
    setSelectedArticle(article);
    setApprovalData({ status: '', comments: '' });
    setShowApprovalModal(true);
  };

  // Cerrar modal de aprobacion
  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedArticle(null);
    setApprovalData({ status: '', comments: '' });
  };

  // Manejar cambio en el formulario de aprobacion
  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    setApprovalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Procesar la aprobacion o rechazo
  const handleProcessApproval = async () => {
    if (!approvalData.status) {
      setError('Debe seleccionar una accion (Aprobar o Rechazar)');
      return;
    }

    if (approvalData.status === 'REJECTED' && !approvalData.comments.trim()) {
      setError('Debe proporcionar un comentario al rechazar el articulo');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Construir request - solo incluir comments si tiene valor
      const request = {
        articleId: selectedArticle.idArticle,
        status: approvalData.status
      };

      // Solo agregar comments si tiene contenido
      if (approvalData.comments.trim()) {
        request.comments = approvalData.comments.trim();
      }

      const response = await approvalService.processApproval(request);

      // Mostrar mensaje de exito con informacion del porcentaje
      let message = `Articulo ${approvalData.status === 'APPROVED' ? 'aprobado' : 'rechazado'} correctamente.`;
      if (response.currentApprovalPercentage !== undefined) {
        message += ` Porcentaje de aprobacion: ${response.currentApprovalPercentage}%`;
      }
      if (response.articleStatus) {
        message += ` - Estado: ${response.articleStatus}`;
      }

      setSuccessMessage(message);
      handleCloseApprovalModal();

      // Recargar la lista
      loadPendingArticles();

      // Limpiar mensaje despues de 5 segundos
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Error al procesar la aprobacion');
    } finally {
      setIsProcessing(false);
    }
  };

  // Ver detalle del articulo
  const handleViewArticle = (id) => {
    navigate(`/approvals/article/${id}`);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener nombre del autor
  const getAuthorName = (article) => {
    if (!article?.author) return 'Desconocido';
    const { firstName, lastName, username } = article.author;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return username || 'Desconocido';
  };

  // Volver al dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="approval-list-container">
        <div className="loading-state">Cargando articulos pendientes...</div>
      </div>
    );
  }

  return (
    <div className="approval-list-container">
      <nav className="approval-list-nav">
        <div className="nav-left">
          <button onClick={handleBack} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Aprobaciones Pendientes</h1>
        </div>
        <div className="nav-role-info">
          <span className="role-label">Rol:</span>
          <span className="role-badge">{userRole}</span>
        </div>
      </nav>

      <div className="approval-list-content">
        {/* Mensajes de error y exito */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Lista de articulos pendientes */}
        {pendingArticles.length === 0 ? (
          <div className="empty-state">
            <h3>No hay articulos pendientes</h3>
            <p>No tiene articulos pendientes de revision en este momento.</p>
          </div>
        ) : (
          <div className="articles-grid">
            {pendingArticles.map((article) => (
              <div key={article.idArticle} className="article-card">
                <div className="article-card-header">
                  <h3 className="article-title">{article.title}</h3>
                  <span className="status-badge status-review">
                    En Revision
                  </span>
                </div>

                <div className="article-card-meta">
                  <div className="meta-item">
                    <span className="meta-label">Autor:</span>
                    <span className="meta-value">{getAuthorName(article)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Fecha:</span>
                    <span className="meta-value">{formatDate(article.createdAt)}</span>
                  </div>
                </div>

                <div className="article-card-preview">
                  {article.content?.substring(0, 150)}
                  {article.content?.length > 150 ? '...' : ''}
                </div>

                <div className="article-card-actions">
                  <button
                    onClick={() => handleViewArticle(article.idArticle)}
                    className="action-button view-button"
                  >
                    Ver Completo
                  </button>

                  {/* Mostrar boton de revisar o badge de ya revisado */}
                  {hasUserRoleReviewedArticle(article.idArticle) ? (
                    <span className="reviewed-badge">
                      Ya revisado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenApprovalModal(article)}
                      className="action-button approve-button"
                    >
                      Revisar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de aprobacion */}
      {showApprovalModal && selectedArticle && (
        <div className="modal-overlay" onClick={handleCloseApprovalModal}>
          <div className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Revisar Articulo</h3>
            <p className="modal-article-title">"{selectedArticle.title}"</p>

            <div className="approval-form">
              <div className="form-group">
                <label>Accion <span className="required">*</span></label>
                <div className="action-buttons">
                  <button
                    type="button"
                    className={`action-choice ${approvalData.status === 'APPROVED' ? 'selected approved' : ''}`}
                    onClick={() => setApprovalData(prev => ({ ...prev, status: 'APPROVED' }))}
                    disabled={isProcessing}
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className={`action-choice ${approvalData.status === 'REJECTED' ? 'selected rejected' : ''}`}
                    onClick={() => setApprovalData(prev => ({ ...prev, status: 'REJECTED' }))}
                    disabled={isProcessing}
                  >
                    Rechazar
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comments">
                  Comentarios {approvalData.status === 'REJECTED' && <span className="required">*</span>}
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={approvalData.comments}
                  onChange={handleApprovalChange}
                  placeholder={approvalData.status === 'REJECTED'
                    ? 'Explique el motivo del rechazo...'
                    : 'Comentarios opcionales...'}
                  rows={4}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleCloseApprovalModal}
                className="modal-button cancel-button"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessApproval}
                className="modal-button confirm-button"
                disabled={isProcessing || !approvalData.status}
              >
                {isProcessing ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalList;
