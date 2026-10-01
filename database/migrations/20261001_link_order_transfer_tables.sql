ALTER TABLE `srspos_compal_test`.`order_header_franchisee`
  ADD UNIQUE KEY `uq_order_header_franchisee_id` (`id`);

ALTER TABLE `srspos_compal_test`.`order_details_franchisee`
  ADD UNIQUE KEY `uq_order_details_franchisee_id` (`id`),
  ADD COLUMN `transferstatus` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `transfer_compal_test`.`0_transfer_header`
  ADD COLUMN `source_order_header_id` INT NULL,
  ADD CONSTRAINT `fk_transfer_header_source_order`
    FOREIGN KEY (`source_order_header_id`)
    REFERENCES `srspos_compal_test`.`order_header_franchisee` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

ALTER TABLE `transfer_compal_test`.`0_transfer_details`
  ADD COLUMN `source_order_detail_id` INT NULL,
  ADD CONSTRAINT `fk_transfer_details_header`
    FOREIGN KEY (`transfer_id`)
    REFERENCES `transfer_compal_test`.`0_transfer_header` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_transfer_details_source_order_detail`
    FOREIGN KEY (`source_order_detail_id`)
    REFERENCES `srspos_compal_test`.`order_details_franchisee` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;