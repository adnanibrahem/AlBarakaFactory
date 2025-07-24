namespace DrawingWindows7
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.listOrders = new System.Windows.Forms.ListBox();
            this.label1 = new System.Windows.Forms.Label();
            this.btnRefresh = new System.Windows.Forms.Button();
            this.drawingImg = new System.Windows.Forms.PictureBox();
            this.label2 = new System.Windows.Forms.Label();
            this.labTitle = new System.Windows.Forms.Label();
            this.labDateAt = new System.Windows.Forms.Label();
            this.labComments = new System.Windows.Forms.Label();
            this.dgv = new System.Windows.Forms.DataGridView();
            this.seq = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.title = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.length = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.width = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.thikness = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.count = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.btnChoseFile = new System.Windows.Forms.Button();
            this.btnSaveData = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.drawingImg)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgv)).BeginInit();
            this.SuspendLayout();
            // 
            // listOrders
            // 
            this.listOrders.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.listOrders.FormattingEnabled = true;
            this.listOrders.ItemHeight = 21;
            this.listOrders.Location = new System.Drawing.Point(1084, 72);
            this.listOrders.Name = "listOrders";
            this.listOrders.Size = new System.Drawing.Size(188, 487);
            this.listOrders.TabIndex = 0;
            this.listOrders.SelectedIndexChanged += new System.EventHandler(this.listOrders_SelectedIndexChanged);
            // 
            // label1
            // 
            this.label1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(1156, 35);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(86, 21);
            this.label1.TabIndex = 1;
            this.label1.Text = "طلبات الرسم";
            // 
            // btnRefresh
            // 
            this.btnRefresh.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.btnRefresh.Location = new System.Drawing.Point(913, 27);
            this.btnRefresh.Name = "btnRefresh";
            this.btnRefresh.Size = new System.Drawing.Size(149, 29);
            this.btnRefresh.TabIndex = 2;
            this.btnRefresh.Text = "تحميل الطلبات";
            this.btnRefresh.UseVisualStyleBackColor = true;
            this.btnRefresh.Click += new System.EventHandler(this.btnRefresh_Click);
            // 
            // drawingImg
            // 
            this.drawingImg.Location = new System.Drawing.Point(12, 51);
            this.drawingImg.Name = "drawingImg";
            this.drawingImg.Size = new System.Drawing.Size(647, 321);
            this.drawingImg.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.drawingImg.TabIndex = 3;
            this.drawingImg.TabStop = false;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(353, 27);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(56, 21);
            this.label2.TabIndex = 1;
            this.label2.Text = "الصورة";
            // 
            // labTitle
            // 
            this.labTitle.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.labTitle.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.labTitle.Location = new System.Drawing.Point(683, 72);
            this.labTitle.Name = "labTitle";
            this.labTitle.Size = new System.Drawing.Size(382, 32);
            this.labTitle.TabIndex = 1;
            this.labTitle.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // labDateAt
            // 
            this.labDateAt.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.labDateAt.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.labDateAt.Location = new System.Drawing.Point(683, 117);
            this.labDateAt.Name = "labDateAt";
            this.labDateAt.Size = new System.Drawing.Size(382, 32);
            this.labDateAt.TabIndex = 1;
            this.labDateAt.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // labComments
            // 
            this.labComments.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.labComments.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.labComments.Location = new System.Drawing.Point(683, 161);
            this.labComments.Name = "labComments";
            this.labComments.Size = new System.Drawing.Size(382, 92);
            this.labComments.TabIndex = 1;
            this.labComments.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // dgv
            // 
            this.dgv.AllowUserToAddRows = false;
            this.dgv.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgv.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.seq,
            this.title,
            this.length,
            this.width,
            this.thikness,
            this.count});
            this.dgv.Location = new System.Drawing.Point(535, 378);
            this.dgv.Name = "dgv";
            this.dgv.RowHeadersWidth = 5;
            this.dgv.Size = new System.Drawing.Size(530, 172);
            this.dgv.TabIndex = 4;
            // 
            // seq
            // 
            this.seq.HeaderText = "#";
            this.seq.Name = "seq";
            this.seq.Width = 40;
            // 
            // title
            // 
            this.title.HeaderText = "المادة";
            this.title.Name = "title";
            this.title.Width = 200;
            // 
            // length
            // 
            this.length.HeaderText = "الطول";
            this.length.Name = "length";
            this.length.Width = 70;
            // 
            // width
            // 
            this.width.HeaderText = "العرض";
            this.width.Name = "width";
            this.width.Width = 70;
            // 
            // thikness
            // 
            this.thikness.HeaderText = "السمك";
            this.thikness.Name = "thikness";
            this.thikness.Width = 70;
            // 
            // count
            // 
            this.count.HeaderText = "العدد";
            this.count.Name = "count";
            this.count.Width = 70;
            // 
            // btnChoseFile
            // 
            this.btnChoseFile.Location = new System.Drawing.Point(353, 400);
            this.btnChoseFile.Name = "btnChoseFile";
            this.btnChoseFile.Size = new System.Drawing.Size(130, 43);
            this.btnChoseFile.TabIndex = 5;
            this.btnChoseFile.Text = "اختر الملف";
            this.btnChoseFile.UseVisualStyleBackColor = true;
            this.btnChoseFile.Click += new System.EventHandler(this.btnUploadFile_Click);
            // 
            // btnSaveData
            // 
            this.btnSaveData.Location = new System.Drawing.Point(353, 475);
            this.btnSaveData.Name = "btnSaveData";
            this.btnSaveData.Size = new System.Drawing.Size(130, 43);
            this.btnSaveData.TabIndex = 5;
            this.btnSaveData.Text = "حفظ البيانات";
            this.btnSaveData.UseVisualStyleBackColor = true;
            this.btnSaveData.Click += new System.EventHandler(this.btnSaveData_Click);
            // 
            // label3
            // 
            this.label3.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.label3.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.label3.Location = new System.Drawing.Point(12, 405);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(335, 32);
            this.label3.TabIndex = 1;
            this.label3.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // MainForm
            // 
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.None;
            this.ClientSize = new System.Drawing.Size(1284, 562);
            this.Controls.Add(this.btnSaveData);
            this.Controls.Add(this.btnChoseFile);
            this.Controls.Add(this.dgv);
            this.Controls.Add(this.drawingImg);
            this.Controls.Add(this.btnRefresh);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.labComments);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.labDateAt);
            this.Controls.Add(this.labTitle);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.listOrders);
            this.Font = new System.Drawing.Font("Times New Roman", 14.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Name = "MainForm";
            this.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "MainForm";
            this.Load += new System.EventHandler(this.MainForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.drawingImg)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgv)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.ListBox listOrders;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Button btnRefresh;
        private System.Windows.Forms.PictureBox drawingImg;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label labTitle;
        private System.Windows.Forms.Label labDateAt;
        private System.Windows.Forms.Label labComments;
        private System.Windows.Forms.DataGridView dgv;
        private System.Windows.Forms.DataGridViewTextBoxColumn seq;
        private System.Windows.Forms.DataGridViewTextBoxColumn title;
        private System.Windows.Forms.DataGridViewTextBoxColumn length;
        private System.Windows.Forms.DataGridViewTextBoxColumn width;
        private System.Windows.Forms.DataGridViewTextBoxColumn thikness;
        private System.Windows.Forms.DataGridViewTextBoxColumn count;
        private System.Windows.Forms.Button btnChoseFile;
        private System.Windows.Forms.Button btnSaveData;
        private System.Windows.Forms.Label label3;
    }
}