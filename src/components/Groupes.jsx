import styles from '../styles/groupes'
import classNames from 'classnames'

import React, { Component } from 'react'

import Toggle from 'cozy-ui/react/Toggle'
import Modal from 'cozy-ui/react/Modal'

class Notifications extends Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }
  render (props, state) {
    return (
      <div>
        <h4>
          Groupes
        </h4>

        <table className={styles['coz-table']}>
          <tr className={classNames(styles['coz-table-head'], styles['coz-table-row'])}>
            <th className={classNames(styles['coz-table-header'], styles['bnk-table-libelle'])}>
              Libellé
            </th>
            <th className={classNames(styles['coz-table-header'], styles['bnk-table-comptes'])}>
              Comptes
            </th>
            <th className={classNames(styles['coz-table-header'], styles['bnk-table-actions'])}>

            </th>
          </tr>
          <tbody className={styles['coz-table-body']}>
            <tr className={styles['coz-table-row']}>
              <td className={classNames(styles['coz-table-cell'], styles['bnk-table-libelle'])}>
                groupe name
              </td>
              <td className={classNames(styles['coz-table-cell'], styles['bnk-table-comptes'])}>
                accounts
              </td>
              <td className={classNames(styles['coz-table-cell'], styles['bnk-table-actions'])}>
                <button className={styles['bnk-action-button']}>
                  éditer
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <Modal
          title={'Editer le groupe'}
        >
          <form className={styles['bnk-form']}>
            <label className={styles['coz-form-label']}>
              Libellé
            </label>
            <input type="text" />

            <label className={styles['coz-form-label']}>
              Comptes
            </label>
            <table className={styles['coz-table-modal']}>
                <tbody className={styles['coz-table-body']}>
                    <tr className={styles['coz-table-row']}>
                        <td className={classNames(styles['coz-table-cell'])}>
                            CCHQ
                        </td>
                        <td className={classNames(styles['coz-table-cell'])}>
                            97896768734
                        </td>
                        <td className={classNames(styles['coz-table-cell'])}>
                            <Toggle name="a" />
                        </td>
                    </tr>
                </tbody>
            </table>
          </form>
        </Modal>

        <button className={classNames(styles['bnk-action-button'], styles['icon-plus'])}>
          Créer un groupe
        </button>
      </div>
    )
  }
}

export default Notifications
