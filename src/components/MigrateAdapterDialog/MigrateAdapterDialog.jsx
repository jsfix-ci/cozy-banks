import React from 'react'

import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import { Button } from 'cozy-ui/transpiled/react/Button'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'

const MigrateAdapterDialog = ({ handleMigrateModaleAnswer }) => {
  const { t } = useI18n()

  const onClose = () => {
    handleMigrateModaleAnswer(false)
  }

  const onConfirm = async () => {
    handleMigrateModaleAnswer(true)
  }

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      title={t('Migration.title')}
      content={t('Migration.content')}
      actions={
        <>
          <Button
            theme="primary"
            label={t('Migration.confirm')}
            onClick={onConfirm}
          />
          <Button
            theme="secondary"
            label={t('Migration.cancel')}
            onClick={onClose}
          />
        </>
      }
    />
  )
}

export default React.memo(MigrateAdapterDialog)
