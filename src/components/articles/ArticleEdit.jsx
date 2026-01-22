import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import articleService from '../../services/article.service';
import './ArticleForm.css';

// Componente para editar un articulo existente
const ArticleEdit = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [originalArticle, setOriginalArticle] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadError, setLoadError] = useState('');

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Reglas de validacion
  const VALIDATION_RULES = {
    title: {
      minLength: 5,
      maxLength: 200
    },
    content: {
      minLength: 20
    }
  };

  // Cargar el articulo al montar el componente
  useEffect(() => {
    loadArticle();
  }, [id]);

  // Funcion para cargar el articulo
  const loadArticle = async () => {
    try {
      setIsLoading(true);
      setLoadError('');

      // Obtener articulos del autor
      const articles = await articleService.getArticlesByAuthor(user.userId);
      const article = articles.find(a => a.idArticle === parseInt(id));

      if (!article) {
        setLoadError('Articulo no encontrado o no tiene permisos para editarlo');
        return;
      }

      // Verificar si el articulo puede ser editado
      if (!articleService.canEdit(article)) {
        setLoadError('Este articulo no puede ser editado. Solo se pueden editar articulos en borrador o marcados.');
        return;
      }

      setOriginalArticle(article);
      setFormData({
        title: article.title || '',
        content: article.content || ''
      });
    } catch (err) {
      setLoadError(err.message || 'Error al cargar el articulo');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar un campo individual
  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return '';

    if (!value || value.trim() === '') {
      return `El campo es requerido`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimo ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximo ${rules.maxLength} caracteres`;
    }

    return '';
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar el campo en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Limpiar error de envio
    setSubmitError('');
  };

  // Manejar envio del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await articleService.updateArticle(id, {
        title: formData.title.trim(),
        content: formData.content.trim()
      });

      // Redirigir a la lista de articulos
      navigate('/articles');
    } catch (err) {
      setSubmitError(err.message || 'Error al actualizar el articulo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar y volver a la lista
  const handleCancel = () => {
    navigate('/articles');
  };

  // Calcular caracteres restantes o faltantes
  const getCharacterInfo = (field) => {
    const value = formData[field];
    const rules = VALIDATION_RULES[field];

    if (rules.minLength && value.length < rules.minLength) {
      return {
        text: `${rules.minLength - value.length} caracteres mas requeridos`,
        type: 'warning'
      };
    }

    if (rules.maxLength) {
      const remaining = rules.maxLength - value.length;
      return {
        text: `${remaining} caracteres restantes`,
        type: remaining < 20 ? 'warning' : 'info'
      };
    }

    return {
      text: `${value.length} caracteres`,
      type: 'info'
    };
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="article-form-container">
        <nav className="article-form-nav">
          <div className="nav-left">
            <button onClick={handleCancel} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Editar Articulo</h1>
          </div>
        </nav>
        <div className="article-form-content">
          <div className="loading-state">Cargando articulo...</div>
        </div>
      </div>
    );
  }

  // Mostrar error de carga
  if (loadError) {
    return (
      <div className="article-form-container">
        <nav className="article-form-nav">
          <div className="nav-left">
            <button onClick={handleCancel} className="back-button">
              Volver
            </button>
            <h1 className="nav-title">Editar Articulo</h1>
          </div>
        </nav>
        <div className="article-form-content">
          <div className="article-form">
            <div className="form-error-message">{loadError}</div>
            <div className="form-actions">
              <button onClick={handleCancel} className="cancel-button">
                Volver a Mis Articulos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-form-container">
      <nav className="article-form-nav">
        <div className="nav-left">
          <button onClick={handleCancel} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Editar Articulo</h1>
        </div>
      </nav>

      <div className="article-form-content">
        <form onSubmit={handleSubmit} className="article-form">
          {/* Error de envio */}
          {submitError && (
            <div className="form-error-message">{submitError}</div>
          )}

          {/* Informacion del estado actual */}
          {originalArticle && (
            <div className="article-status-info">
              <span className="status-label">Estado actual:</span>
              <span className={`status-badge ${articleService.getStatusClass(originalArticle.status?.idArticleStatus)}`}>
                {originalArticle.status?.statusName || articleService.getStatusName(originalArticle.status?.idArticleStatus)}
              </span>
            </div>
          )}

          {/* Campo de titulo */}
          <div className="form-group">
            <label htmlFor="title">
              Titulo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ingrese el titulo del articulo"
              disabled={isSubmitting}
              className={errors.title ? 'input-error' : ''}
            />
            <div className="field-footer">
              {errors.title && (
                <span className="field-error">{errors.title}</span>
              )}
              <span className={`char-count ${getCharacterInfo('title').type}`}>
                {getCharacterInfo('title').text}
              </span>
            </div>
          </div>

          {/* Campo de contenido */}
          <div className="form-group">
            <label htmlFor="content">
              Contenido <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Escriba el contenido del articulo..."
              disabled={isSubmitting}
              rows={15}
              className={errors.content ? 'input-error' : ''}
            />
            <div className="field-footer">
              {errors.content && (
                <span className="field-error">{errors.content}</span>
              )}
              <span className={`char-count ${getCharacterInfo('content').type}`}>
                {getCharacterInfo('content').text}
              </span>
            </div>
          </div>

          {/* Botones de accion */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleEdit;
