import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articleService from '../../services/article.service';
import './ArticleForm.css';

// Componente para crear un nuevo articulo
const ArticleCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();

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
      await articleService.createArticle({
        title: formData.title.trim(),
        content: formData.content.trim()
      });

      // Redirigir a la lista de articulos
      navigate('/articles');
    } catch (err) {
      setSubmitError(err.message || 'Error al crear el articulo');
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

  return (
    <div className="article-form-container">
      <nav className="article-form-nav">
        <div className="nav-left">
          <button onClick={handleCancel} className="back-button">
            Volver
          </button>
          <h1 className="nav-title">Crear Articulo</h1>
        </div>
      </nav>

      <div className="article-form-content">
        <form onSubmit={handleSubmit} className="article-form">
          {/* Error de envio */}
          {submitError && (
            <div className="form-error-message">{submitError}</div>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleCreate;
