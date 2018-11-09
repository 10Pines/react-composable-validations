import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { noop } from '../validations';

import { Field } from '../models';

export const connectField = (Component) => {
  @inject('formosa_form') @observer class Wrapper extends React.Component {
    static defaultProps = {
      validation: noop,
    }
    static propTypes = {
      defaultValue: PropTypes.any,
      name: PropTypes.string.isRequired,
      onChange: PropTypes.func,
      validation: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);
      const defaultValue = this.props.defaultValue === undefined ? '' : this.props.defaultValue;
      this.state = {
        field: new Field(this.props.validation, defaultValue)
      };
    }

    componentWillMount() {
      this.props.formosa_form.registerField(this.props.name, this.state.field);
    }

    handleNewValue (evt, newValue) {
      if (newValue !== undefined) {
        this.state.field.input = newValue;
      } else if (evt.target.type === 'checkbox') {
        this.state.field.input = evt.target.checked;
      } else {
        this.state.field.input = evt.target.value;
      }
    }

    componentWillUnmount() {
      this.state.field.delete();
    }

    render () {
      const { field } = this.state
      const props = Object.assign({}, this.props);
      props.wasTouched = field.wasTouched
      props.errorMessage = field.errorMessage;
      delete props.onValid;
      delete props.onChange;
      delete props.validation;
      delete props.formosa_form;

      return (
        <Component
          {...props}
          onChange={(evt, newValue) => {
            this.handleNewValue(evt, newValue);
            if (this.props.onChange) {
              this.props.onChange(evt, this.state.field);
            }
          }}
        />
      );
    }
  }
  Wrapper.displayName = `formosa-field-${Component.displayName || Component.name || 'Component'}`;
  return Wrapper;
}