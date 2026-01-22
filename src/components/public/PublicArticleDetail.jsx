import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import './PublicArticleDetail.css';

// Componente para mostrar el detalle de un articulo publicado (acceso publico)
const PublicArticleDetail = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  // Cargar articulo al montar el componente
  useEffect(() => {
    loadArticle();
  }, [id]);

  // Funcion para cargar el articulo
  const loadArticle = async () => {
    try {
      setLoading(true);
      setError('');

      const articleData = await articleService.getArticleById(id);

      // Verificar que el articulo este publicado (status = 2)
      if (articleData.status?.idArticleStatus !== 2) {
        setError('Este articulo no esta disponible para visualizacion publica.');
        setArticle(null);
        return;
      }

      setArticle(articleData);
    } catch (err) {
      setError(err.message || 'Error al cargar el articulo');
    } finally {
      setLoading(false);
    }
  };

  // Volver a la lista de articulos
  const handleBack = () => {
    navigate('/public/articles');
  };

  // Ir a login
  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Ir al dashboard si esta autenticado
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener nombre del autor
  const getAuthorName = () => {
    if (!article?.author) return 'Autor desconocido';
    const { firstName, lastName, username } = article.author;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return username || 'Autor desconocido';
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="public-detail-container">
        <nav className="public-detail-nav">
          <div className="nav-left">
            <button onClick={handleBack} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Portal Periodistico</h1>
          </div>
        </nav>
        <div className="public-detail-content">
          <div className="loading-state">Cargando articulo...</div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !article) {
    return (
      <div className="public-detail-container">
        <nav className="public-detail-nav">
          <div className="nav-left">
            <button onClick={handleBack} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Portal Periodistico</h1>
          </div>
        </nav>
        <div className="public-detail-content">
          <div className="error-card">
            <h3>Articulo no disponible</h3>
            <p>{error || 'El articulo que buscas no existe o no esta publicado.'}</p>
            <button onClick={handleBack} className="back-link">
              Volver a Articulos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-detail-container">
      <nav className="public-detail-nav">
        <div className="nav-left">
          <button onClick={handleBack} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Portal Periodistico</h1>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <button onClick={handleGoToDashboard} className="nav-button">
              Ir al Dashboard
            </button>
          ) : (
            <button onClick={handleGoToLogin} className="login-button">
              Iniciar Sesion
            </button>
          )}
        </div>
      </nav>

      <div className="public-detail-content">
        <article className="article-full">
          <header className="article-header">
            <h1 className="article-title">{article.title}</h1>
            <div className="article-meta">
              <div className="meta-author">
                <span className="meta-label">Por</span>
                <span className="author-name">{getAuthorName()}</span>
              </div>
              <div className="meta-date">
                <span className="meta-label">Publicado el</span>
                <span className="publish-date">{formatDate(article.createdAt)}</span>
              </div>
            </div>
          </header>

          <div className="article-body">
            {article.content?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <footer className="article-footer">
            <button onClick={handleBack} className="back-to-list">
              Ver mas articulos
            </button>
          </footer>
        </article>
      </div>

      <footer className="public-footer">
        <p>Portal Periodistico - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default PublicArticleDetail;
