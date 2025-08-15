import { forwardRef } from 'react';
import classNames from 'classnames';

const Input = forwardRef(({ 
  label,
  error,
  helpText,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const inputClasses = classNames(
    'form-input',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-500': error,
      'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !error
    },
    className
  );

  return (
    <div className={containerClassName}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;