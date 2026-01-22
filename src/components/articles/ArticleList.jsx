import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import './ArticleList.css';

// Componente para listar los articulos del usuario
const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar articulos al montar el componente
  useEffect(() => {
    loadArticles();
  }, []);

  // Funcion para cargar los articulos del usuario
  const loadArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await articleService.getArticlesByAuthor(user.userId);
      setArticles(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los articulos');
    } finally {
      setLoading(false);
    }
  };

  // Navegar a crear articulo
  const handleCreate = () => {
    navigate('/articles/create');
  };

  // Navegar a ver detalle del articulo
  const handleView = (id) => {
    navigate(`/articles/detail/${id}`);
  };

  // Navegar a editar articulo
  const handleEdit = (id) => {
    navigate(`/articles/edit/${id}`);
  };

  // Mostrar modal de confirmacion para eliminar
  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  // Confirmar eliminacion del articulo
  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await articleService.deleteArticle(articleToDelete.idArticle);
      setSuccessMessage('Articulo eliminado correctamente');
      setShowDeleteModal(false);
      setArticleToDelete(null);
      // Recargar la lista
      loadArticles();
      // Limpiar mensaje despues de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar el articulo');
      setShowDeleteModal(false);
    }
  };

  // Cancelar eliminacion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setArticleToDelete(null);
  };

  // Enviar articulo a revision
  const handleSendToReview = async (id) => {
    try {
      setError('');
      await articleService.sendToReview(id);
      setSuccessMessage('Articulo enviado a revision correctamente');
      // Recargar la lista
      loadArticles();
      // Limpiar mensaje despues de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al enviar el articulo a revision');
    }
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

  // Navegar al dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="article-list-container">
        <div className="loading-state">Cargando articulos...</div>
      </div>
    );
  }

  return (
    <div className="article-list-container">
      <nav className="article-list-nav">
        <div className="nav-left">
          <button onClick={handleBack} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Mis Articulos</h1>
        </div>
        <button onClick={handleCreate} className="create-button">
          Nuevo Articulo
        </button>
      </nav>

      <div className="article-list-content">
        {/* Mensajes de error y exito */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Lista de articulos */}
        {articles.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes articulos</h3>
            <p>Crea tu primer articulo para comenzar</p>
            <button onClick={handleCreate} className="create-button">
              Crear Articulo
            </button>
          </div>
        ) : (
          <div className="articles-table-container">
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Estado</th>
                  <th>Fecha de Creacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.idArticle}>
                    <td className="article-title-cell">
                      {article.title}
                    </td>
                    <td>
                      <span className={`status-badge ${articleService.getStatusClass(article.status?.idArticleStatus)}`}>
                        {article.status?.statusName || articleService.getStatusName(article.status?.idArticleStatus)}
                      </span>
                    </td>
                    <td>{formatDate(article.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleView(article.idArticle)}
                        className="action-button view-button"
                        title="Ver detalle"
                      >
                        Ver
                      </button>
                      {articleService.canEdit(article) && (
                        <button
                          onClick={() => handleEdit(article.idArticle)}
                          className="action-button edit-button"
                          title="Editar"
                        >
                          Editar
                        </button>
                      )}
                      {articleService.canSendToReview(article) && (
                        <button
                          onClick={() => handleSendToReview(article.idArticle)}
                          className="action-button review-button"
                          title="Enviar a revision"
                        >
                          Enviar
                        </button>
                      )}
                      {articleService.canDelete(article) && (
                        <button
                          onClick={() => handleDeleteClick(article)}
                          className="action-button delete-button"
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmacion para eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminacion</h3>
            <p>¿Esta seguro que desea eliminar el articulo "{articleToDelete?.title}"?</p>
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

export default ArticleList;
