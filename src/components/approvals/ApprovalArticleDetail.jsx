import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import approvalService from '../../services/approval.service';
import './ApprovalArticleDetail.css';

// Componente para ver el detalle de un articulo y procesarlo
const ApprovalArticleDetail = () => {
  const [article, setArticle] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para el formulario de aprobacion
  const [approvalData, setApprovalData] = useState({
    status: '',
    comments: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  // Cargar articulo al montar el componente
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
        console.log('No se encontro historial de aprobaciones');
        setApprovalHistory([]);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el articulo');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en el formulario de aprobacion
  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    setApprovalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Seleccionar accion (aprobar/rechazar)
  const handleSelectAction = (status) => {
    setApprovalData(prev => ({ ...prev, status }));
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
        articleId: parseInt(id),
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

      // Limpiar formulario
      setApprovalData({ status: '', comments: '' });

      // Recargar datos del articulo
      loadArticleData();

      // Redirigir despues de 2 segundos
      setTimeout(() => {
        navigate('/approvals');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al procesar la aprobacion');
    } finally {
      setIsProcessing(false);
    }
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

  // Volver a la lista de aprobaciones
  const handleBack = () => {
    navigate('/approvals');
  };

  // Verificar si el articulo esta en revision
  const isInReview = article?.status?.idArticleStatus === 3;

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="approval-detail-container">
        <nav className="approval-detail-nav">
          <div className="nav-left">
            <button onClick={handleBack} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Revisar Articulo</h1>
          </div>
        </nav>
        <div className="approval-detail-content">
          <div className="loading-state">Cargando articulo...</div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error && !article) {
    return (
      <div className="approval-detail-container">
        <nav className="approval-detail-nav">
          <div className="nav-left">
            <button onClick={handleBack} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Revisar Articulo</h1>
          </div>
        </nav>
        <div className="approval-detail-content">
          <div className="error-card">
            <div className="error-message">{error}</div>
            <button onClick={handleBack} className="back-link">
              Volver a Aprobaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-detail-container">
      <nav className="approval-detail-nav">
        <div className="nav-left">
          <button onClick={handleBack} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Revisar Articulo</h1>
        </div>
        <div className="nav-role-info">
          <span className="role-label">Revisando como:</span>
          <span className="role-badge">{userRole}</span>
        </div>
      </nav>

      <div className="approval-detail-content">
        {/* Mensajes */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="detail-layout">
          {/* Contenido del articulo */}
          <div className="article-section">
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
              </div>

              <div className="article-content">
                <h3>Contenido del Articulo</h3>
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

          {/* Panel de aprobacion */}
          {isInReview && (
            <div className="approval-panel">
              <div className="approval-form-card">
                <h3>Tu Decision</h3>
                <p className="form-description">
                  Revisa el articulo y selecciona tu decision como {userRole}.
                </p>

                <div className="approval-form">
                  <div className="form-group">
                    <label>Accion <span className="required">*</span></label>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className={`action-choice ${approvalData.status === 'APPROVED' ? 'selected approved' : ''}`}
                        onClick={() => handleSelectAction('APPROVED')}
                        disabled={isProcessing}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className={`action-choice ${approvalData.status === 'REJECTED' ? 'selected rejected' : ''}`}
                        onClick={() => handleSelectAction('REJECTED')}
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
                      rows={5}
                      disabled={isProcessing}
                    />
                  </div>

                  <button
                    onClick={handleProcessApproval}
                    className="submit-button"
                    disabled={isProcessing || !approvalData.status}
                  >
                    {isProcessing ? 'Procesando...' : 'Confirmar Decision'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje si el articulo ya no esta en revision */}
          {!isInReview && (
            <div className="approval-panel">
              <div className="approval-form-card">
                <h3>Articulo No Disponible</h3>
                <p className="not-available-message">
                  Este articulo ya no esta en estado de revision.
                  Su estado actual es: <strong>{article?.status?.statusName}</strong>
                </p>
                <button onClick={handleBack} className="back-button-large">
                  Volver a Aprobaciones
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalArticleDetail;
