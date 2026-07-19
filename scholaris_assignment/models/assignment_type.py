# Part of Scholaris. See LICENSE file for full copyright & licensing details.

##############################################################################
#
#    Scholaris Inc
#    Copyright (C) 2009-TODAY Scholaris Inc(<https://www.scholaris.org>).
#
##############################################################################

from odoo import fields, models


class GradingAssigmentType(models.Model):
    _name = 'grading.assignment.type'
    _description = "Assignment Type"

    name = fields.Char(string="Name", required=True)
    code = fields.Char(string="Code")
    assign_type = fields.Selection([('sub', 'Subjective'),
                                    ('attendance', 'Attendance')],
                                   string='Type', default='sub')
