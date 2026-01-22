import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import './PublicArticleList.css';

// Componente para mostrar articulos publicados (acceso publico sin autenticacion)
const PublicArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Cargar articulos publicados al montar el componente
  useEffect(() => {
    loadPublishedArticles();
  }, []);

  // Funcion para cargar los articulos publicados
  const loadPublishedArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await articleService.getAllPublishedArticles();
      // Filtrar solo articulos publicados (status = 2)
      const publishedArticles = data.filter(
        article => article.status?.idArticleStatus === 2
      );
      setArticles(publishedArticles);
    } catch (err) {
      setError(err.message || 'Error al cargar los articulos');
    } finally {
      setLoading(false);
    }
  };

  // Ver detalle del articulo
  const handleViewArticle = (id) => {
    navigate(`/public/articles/${id}`);
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
  const getAuthorName = (article) => {
    if (!article?.author) return 'Autor desconocido';
    const { firstName, lastName, username } = article.author;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return username || 'Autor desconocido';
  };

  // Obtener extracto del contenido
  const getExcerpt = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="public-list-container">
      <nav className="public-list-nav">
        <h1 className="nav-title">Portal Periodistico</h1>
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

      <header className="public-header">
        <h2>Articulos Publicados</h2>
        <p>Explora las ultimas noticias y articulos de nuestro portal</p>
      </header>

      <div className="public-list-content">
        {/* Mensaje de error */}
        {error && <div className="error-message">{error}</div>}

        {/* Estado de carga */}
        {loading ? (
          <div className="loading-state">Cargando articulos...</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <h3>No hay articulos publicados</h3>
            <p>Aun no hay articulos disponibles para mostrar.</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => (
              <article
                key={article.idArticle}
                className="article-card"
                onClick={() => handleViewArticle(article.idArticle)}
              >
                <div className="article-card-content">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-excerpt">
                    {getExcerpt(article.content)}
                  </p>
                </div>
                <div className="article-card-footer">
                  <div className="article-meta">
                    <span className="author-name">{getAuthorName(article)}</span>
                    <span className="publish-date">{formatDate(article.createdAt)}</span>
                  </div>
                  <span className="read-more">Leer mas</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="public-footer">
        <p>Portal Periodistico - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default PublicArticleList;
