"""create photos table

Revision ID: 75fbb6e3779a
Revises: 6ff62e83bde3
Create Date: 2021-05-03 05:10:49.806603

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '75fbb6e3779a'
down_revision = '6ff62e83bde3'
branch_labels = None
depends_on = None


def upgrade(engine_name):
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name):
    globals()["downgrade_%s" % engine_name]()


def upgrade_dev():
    op.create_table(
        "Photos",
        sa.Column("id", sa.String(27), primary_key=True),
        sa.Column("email", sa.Text, sa.ForeignKey("Users.email", ondelete="CASCADE")),
        sa.Column("file_name", sa.Text, nullable=False),
        sa.Column("s3_key", sa.Text, nullable=False),
        sa.Column("s3_thumbnail_key", sa.Text, nullable=False),
        sa.Column("file_type", sa.String(5), nullable=False),
        sa.Column("height", sa.Integer, nullable=False),
        sa.Column("width", sa.Integer, nullable=False),
        sa.Column("size", sa.Float, nullable=False),
        sa.Column("uploaded_at", sa.DateTime, server_default=sa.func.current_timestamp())
    )


def downgrade_dev():
    op.drop_table("Photos")


def upgrade_prod():
    op.create_table(
        "Photos",
        sa.Column("id", sa.String(27), primary_key=True),
        sa.Column("email", sa.Text, sa.ForeignKey("Users.email", ondelete="CASCADE")),
        sa.Column("file_name", sa.Text, nullable=False),
        sa.Column("s3_key", sa.Text, nullable=False),
        sa.Column("s3_thumbnail_key", sa.Text, nullable=False),
        sa.Column("file_type", sa.String(5), nullable=False),
        sa.Column("height", sa.Integer, nullable=False),
        sa.Column("width", sa.Integer, nullable=False),
        sa.Column("size", sa.Float, nullable=False),
        sa.Column("uploaded_at", sa.DateTime, server_default=sa.func.current_timestamp())
    )


def downgrade_prod():
    op.drop_table("Photos")
