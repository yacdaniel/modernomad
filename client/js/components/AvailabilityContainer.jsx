import React, {PropTypes} from 'react'
import AvailabilityManager from './AvailabilityManager'
import { clone, reject, sortBy } from 'lodash'
import axios from 'axios'
import moment from 'moment'

axios.defaults.xsrfCookieName = "csrftoken"
axios.defaults.xsrfHeaderName = "X-CSRFToken"

export default class AvailabilityContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      upcomingAvailabilities: this.sortedAvailabilities(props.upcomingAvailabilities),
      formLoading: false
    }
  }

  static propTypes = {
    resourceId: PropTypes.number.isRequired
  }

  addAvailability(values) {
    axios.post(`/api/availabilities/`, {
        start_date: moment(values.start_date).format(),
        quantity: values.quantity,
        resource: this.props.resourceId
      })
      .then((response) => {
        this.insertAvailability(response.data)
      })
      .catch((error) => {
        console.log("error occured in post", error);
      });
  }

  triggerDelete(availabilityId) {
    axios.delete(`/api/availability/${availabilityId}`)
      .then((response) => {
        this.deleteAvailability(availabilityId)
      })
      .catch((error) => {
        console.log("error occured in delete", error);
      });
  }

  sortedAvailabilities(availabilities) {
    return sortBy(availabilities, (availability) => {
      return moment(availability.start_date)
    })
  }

  insertAvailability(availability) {
    const newCollection = this.sortedAvailabilities([...this.state.upcomingAvailabilities, availability])
    this.setState({
      upcomingAvailabilities: newCollection
    })
  }

  deleteAvailability(availabilityId) {
    this.setState({
      upcomingAvailabilities: reject(this.state.upcomingAvailabilities, {id: availabilityId})
    })
  }

  render() {
    return <AvailabilityManager
      currentAvailability={this.state.currentAvailability}
      upcomingAvailabilities={this.state.upcomingAvailabilities}
      formLoading={this.state.formLoading}
      onSubmitNew={this.addAvailability.bind(this)}
      onDelete={this.triggerDelete.bind(this)} />;
  }
}
