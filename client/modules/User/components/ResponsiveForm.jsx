import styled from 'styled-components';
import { remSize } from '../../../theme';


const ResponsiveForm = styled.div`
  .form-container__content {
    width: unset !important;
    padding-top: ${remSize(16)};
    padding-bottom: ${remSize(64)};
  }
  
  .form__input {
    min-width: unset;
    padding: 0px ${remSize(12)};
    height: ${remSize(28)};
  }
  .form-container__title { margin-bottom: ${remSize(14)}}
  p.form__field { margin-top: 0px !important; }
  label.form__label { margin-top: ${remSize(8)} !important; }

  .form-error { width: 100% }

  .nav__items-right:last-child { display: none }

  .form-container {
    height: 100%
  }

  .nav__dropdown {
    right: 0 !important;
    left: unset !important;
  }

  .form-container__stack {
    svg {
      width: ${remSize(12)};
      height: ${remSize(12)}
    }
    a { padding: 0px }
  }
`;

export default ResponsiveForm;
